import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, In, IsNull } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductVariants } from './entities/product-variants.entity';
import { Attributes } from './entities/attributes.entity';
import { AttributeValues } from './entities/attribute-values.entity';
import {
  CreateVariantDto,
  VariantAttributeValueDto,
} from './dtos/create-variant.dto';
import {
  AttributeKind,
  inferAttributeKind,
} from './constants/attribute-kind';
import { MediaStaticService } from '../media/media-static.service';
import { MediaOwnerType } from '../media/enums/media-owner-type.enum';

type NormalizedAttr = {
  name: string;
  kind: AttributeKind;
  value: string;
  colorHex: string | null;
};

export type ParentPricing = {
  price: number;
  priceDiscount: number;
  percentageDiscount: number;
  stock: number;
};

const attrKey = (a: NormalizedAttr) =>
  `${a.name}:::${a.value}:::${a.colorHex ?? ''}`;

@Injectable()
export class ProductVariantsService {
  constructor(private readonly mediaService: MediaStaticService) {}

  /** Normalizes the attribute values of one variant (trim, kind, color). */
  private normalizeAttrs(
    items: VariantAttributeValueDto[],
    variantIndex: number,
  ): NormalizedAttr[] {
    const seenNames = new Set<string>();

    return items.map((item) => {
      const name = item.attributeName.trim();
      const value = item.value.trim();
      const kind = item.kind ?? inferAttributeKind(name);
      const row = variantIndex + 1;

      if (!name || !value) {
        throw new BadRequestException(
          `نام و مقدار ویژگی در تنوع شماره ${row} الزامی است.`,
        );
      }
      if (seenNames.has(name)) {
        throw new BadRequestException(
          `ویژگی «${name}» در تنوع شماره ${row} تکراری است.`,
        );
      }
      seenNames.add(name);

      if (kind === 'color' && !item.colorHex) {
        throw new BadRequestException(
          `برای تنوع رنگی شماره ${row} انتخاب کد رنگ الزامی است.`,
        );
      }

      return {
        name,
        kind,
        value,
        colorHex:
          kind === 'color' && item.colorHex ? item.colorHex.toUpperCase() : null,
      };
    });
  }

  /** Validates the whole variants payload and returns it normalized. */
  validate(variants: CreateVariantDto[] | undefined): NormalizedAttr[][] {
    if (!Array.isArray(variants) || variants.length === 0) {
      throw new BadRequestException(
        'برای محصول دارای تنوع، حداقل یک تنوع باید تعریف شود.',
      );
    }

    const skus = new Set<string>();
    const combos = new Set<string>();
    let nameSignature: string | null = null;

    return variants.map((v, idx) => {
      const row = idx + 1;

      if (v.priceDiscount && v.priceDiscount >= v.price) {
        throw new BadRequestException(
          `قیمت با تخفیف تنوع شماره ${row} باید کمتر از قیمت اصلی باشد.`,
        );
      }

      const attrs = this.normalizeAttrs(v.attributeValues, idx);

      const signature = attrs
        .map((a) => a.name)
        .sort()
        .join('|');
      if (nameSignature === null) nameSignature = signature;
      else if (nameSignature !== signature) {
        throw new BadRequestException(
          'همه تنوع‌های یک محصول باید از یک نوع ویژگی باشند (مثلاً همگی حجمی یا همگی رنگی).',
        );
      }

      const combo = attrs
        .map((a) => `${a.name}=${a.value}`)
        .sort()
        .join('|');
      if (combos.has(combo)) {
        throw new BadRequestException(
          `تنوع شماره ${row} تکراری است (${attrs.map((a) => a.value).join('، ')}).`,
        );
      }
      combos.add(combo);

      const sku = v.sku?.trim();
      if (sku) {
        if (skus.has(sku)) {
          throw new BadRequestException(`SKU «${sku}» بین تنوع‌ها تکراری است.`);
        }
        skus.add(sku);
      }

      return attrs;
    });
  }

  /** Finds or creates Attributes / AttributeValues rows for all variants. */
  private async resolveAttributeValues(
    manager: EntityManager,
    normalized: NormalizedAttr[][],
  ): Promise<Map<string, AttributeValues>> {
    const resolved = new Map<string, AttributeValues>();
    const attributeCache = new Map<string, Attributes>();

    for (const attr of normalized.flat()) {
      const key = attrKey(attr);
      if (resolved.has(key)) continue;

      let attribute = attributeCache.get(attr.name);
      if (!attribute) {
        attribute =
          (await manager.findOne(Attributes, { where: { name: attr.name } })) ??
          (await manager.save(
            Attributes,
            manager.create(Attributes, { name: attr.name, kind: attr.kind }),
          ));
        if (attribute.kind !== attr.kind && attr.kind !== 'custom') {
          attribute.kind = attr.kind;
          attribute = await manager.save(Attributes, attribute);
        }
        attributeCache.set(attr.name, attribute);
      }

      const valueEntity =
        (await manager.findOne(AttributeValues, {
          where: {
            value: attr.value,
            attribute: { id: attribute.id },
            colorHex: attr.colorHex ?? IsNull(),
          },
          relations: { attribute: true },
        })) ??
        (await manager.save(
          AttributeValues,
          manager.create(AttributeValues, {
            value: attr.value,
            colorHex: attr.colorHex,
            attribute,
          }),
        ));

      resolved.set(key, valueEntity);
    }

    return resolved;
  }

  /** Throws when an explicit SKU already belongs to another product or variant. */
  private async assertSkusAvailable(
    manager: EntityManager,
    variants: CreateVariantDto[],
    ownIds: number[],
  ): Promise<void> {
    const skus = variants.map((v) => v.sku?.trim()).filter((s): s is string => !!s);
    if (!skus.length) return;

    const [variantClash, productClash] = await Promise.all([
      manager.find(ProductVariants, {
        where: { sku: In(skus) },
        loadEagerRelations: false,
      }),
      manager.find(Products, {
        where: { sku: In(skus) },
        select: { id: true, sku: true },
        loadEagerRelations: false,
      }),
    ]);

    const clash =
      variantClash.find((v) => !ownIds.includes(v.id))?.sku ??
      productClash[0]?.sku;
    if (clash) {
      throw new BadRequestException(`SKU «${clash}» قبلاً استفاده شده است.`);
    }
  }

  /**
   * Upserts the variants of a product inside the caller's transaction.
   * Variants that are no longer sent are removed; when an order still
   * references one, it is disabled instead (via a savepoint so the outer
   * transaction stays usable).
   */
  async sync(
    manager: EntityManager,
    product: Products,
    current: ProductVariants[],
    incoming: CreateVariantDto[],
  ): Promise<ProductVariants[]> {
    const normalized = this.validate(incoming);
    const currentById = new Map(current.map((v) => [v.id, v]));

    for (const v of incoming) {
      if (v.id !== undefined && !currentById.has(v.id)) {
        throw new BadRequestException(
          `تنوع با شناسه ${v.id} متعلق به این محصول نیست.`,
        );
      }
    }

    await this.assertSkusAvailable(manager, incoming, [...currentById.keys()]);

    const keepIds = new Set(
      incoming.map((v) => v.id).filter((id): id is number => id !== undefined),
    );
    const oldImageUrls = current.flatMap((v) => v.images ?? []);

    await this.removeStale(
      manager,
      current.filter((v) => !keepIds.has(v.id)),
    );

    const attrMap = await this.resolveAttributeValues(manager, normalized);
    const saved: ProductVariants[] = [];

    for (let idx = 0; idx < incoming.length; idx++) {
      const v = incoming[idx];
      const entity =
        (v.id !== undefined ? currentById.get(v.id) : undefined) ??
        manager.create(ProductVariants, { product });

      entity.sku =
        v.sku?.trim() ||
        entity.sku ||
        `VAR-${product.id}-${idx + 1}-${Math.random().toString(36).slice(2, 6)}`;
      entity.price = v.price;
      entity.priceDiscount = v.priceDiscount ?? 0;
      entity.percentageDiscount = this.percent(v.price, entity.priceDiscount);
      entity.stock = v.stock;
      entity.isAvailable = v.isAvailable ?? true;
      entity.images = v.images ?? [];
      entity.attributeValues = normalized[idx].map(
        (a) => attrMap.get(attrKey(a))!,
      );

      saved.push(await manager.save(ProductVariants, entity));
    }

    for (const variant of saved) {
      if (variant.images.length) {
        await this.mediaService
          .reassignOwner(
            variant.images,
            MediaOwnerType.PRODUCT_VARIANT,
            String(variant.id),
          )
          .catch(() => {});
      }
    }

    const newUrls = new Set(saved.flatMap((v) => v.images));
    const orphaned = oldImageUrls.filter((url) => !newUrls.has(url));
    if (orphaned.length) {
      await this.mediaService.deleteByUrls(orphaned).catch(() => {});
    }

    return saved;
  }

  /** Removes all variants of a product (e.g. when it stops being a variant product). */
  async removeAll(
    manager: EntityManager,
    current: ProductVariants[],
  ): Promise<void> {
    await this.removeStale(manager, current);
    const urls = current.flatMap((v) => v.images ?? []);
    if (urls.length) await this.mediaService.deleteByUrls(urls).catch(() => {});
  }

  private async removeStale(
    manager: EntityManager,
    stale: ProductVariants[],
  ): Promise<void> {
    for (const variant of stale) {
      await manager.query('SAVEPOINT variant_remove');
      try {
        await manager.remove(ProductVariants, variant);
        await manager.query('RELEASE SAVEPOINT variant_remove');
      } catch {
        await manager.query('ROLLBACK TO SAVEPOINT variant_remove');
        variant.isAvailable = false;
        variant.stock = 0;
        await manager.save(ProductVariants, variant);
      }
    }
  }

  /** Product-level price/stock derived from its variants (cheapest sellable one). */
  derivePricing(variants: ProductVariants[]): ParentPricing {
    const effective = (v: ProductVariants) =>
      v.priceDiscount > 0 ? v.priceDiscount : v.price;
    const active = variants.filter((v) => v.isAvailable && v.stock > 0);
    const pool = active.length ? active : variants;
    const cheapest = pool.reduce((a, b) => (effective(a) <= effective(b) ? a : b));

    return {
      price: cheapest.price,
      priceDiscount: cheapest.priceDiscount,
      percentageDiscount: this.percent(cheapest.price, cheapest.priceDiscount),
      stock: variants.reduce((sum, v) => sum + v.stock, 0),
    };
  }

  private percent(price: number, discount: number): number {
    if (!discount || discount <= 0 || discount >= price) return 0;
    return Math.round(((price - discount) / price) * 100 * 100) / 100;
  }
}
