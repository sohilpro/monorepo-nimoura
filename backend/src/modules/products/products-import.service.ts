import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ImportPriceItemDto,
  ImportPricesDto,
  PriceTierDto,
} from './dtos/import-prices.dto';
import { Products } from './entities/products.entity';
import { ProductVariants } from './entities/product-variants.entity';
import { ProductPriceTiers } from './entities/product-price-tiers.entity';

type RowError = { row: number; sku: string; message: string };
type Owner = Products | ProductVariants;

@Injectable()
export class ProductsImportService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private calcPercent(price: number, discount: number): number {
    if (!discount || discount <= 0 || discount >= price) return 0;
    return Math.round(((price - discount) / price) * 100 * 100) / 100;
  }

  private validatePrices(price: number, priceDiscount: number): string | null {
    if (price <= 0) return 'قیمت اصلی باید بزرگ‌تر از صفر باشد';
    if (priceDiscount < 0) return 'قیمت با تخفیف نامعتبر است';
    if (priceDiscount > 0 && priceDiscount >= price)
      return 'قیمت با تخفیف باید کمتر از قیمت اصلی باشد';
    return null;
  }

  /** اعتبارسنجی پله‌های قیمت عمده نسبت به قیمت اصلی جدید */
  private validateTiers(tiers: PriceTierDto[], basePrice: number): string | null {
    if (!tiers.length) return null; // آرایه خالی یعنی حذف همه پله‌ها؛ مجاز است

    const seen = new Set<number>();
    for (const t of tiers) {
      if (!Number.isInteger(t.minQuantity) || t.minQuantity < 1)
        return `تعداد پله «${t.minQuantity}» نامعتبر است`;
      if (seen.has(t.minQuantity))
        return `تعداد پله «${t.minQuantity}» تکراری است`;
      seen.add(t.minQuantity);

      if (!Number.isInteger(t.price) || t.price <= 0)
        return `قیمت پله برای تعداد ${t.minQuantity} باید عدد صحیح و بزرگ‌تر از صفر باشد`;
      if (t.price >= basePrice)
        return `قیمت پله برای تعداد ${t.minQuantity} باید کمتر از قیمت اصلی (${basePrice}) باشد`;
    }
    return null;
  }

  /** آیا پله‌های جدید با پله‌های فعلی تفاوت دارند؟ */
  private tiersChanged(current: ProductPriceTiers[], incoming: PriceTierDto[]): boolean {
    if (current.length !== incoming.length) return true;
    const a = [...current].sort((x, y) => x.minQuantity - y.minQuantity);
    const b = [...incoming].sort((x, y) => x.minQuantity - y.minQuantity);
    return a.some((t, i) => t.minQuantity !== b[i].minQuantity || t.price !== b[i].price);
  }

  /** همگام‌سازی پله‌های قیمت یک محصول یا واریانت (insert/update/delete) */
  private async syncTiers(manager: any, entity: Owner, tiers: PriceTierDto[]) {
    const current: ProductPriceTiers[] = (entity as any).priceTiers ?? [];
    const existingMap = new Map(current.map((t) => [t.minQuantity, t]));
    const incomingQtys = new Set(tiers.map((t) => t.minQuantity));

    const toDelete = current.filter((t) => !incomingQtys.has(t.minQuantity));
    const toSave: ProductPriceTiers[] = [];

    const isVariant = entity instanceof ProductVariants;

    for (const t of tiers) {
      const found = existingMap.get(t.minQuantity);
      if (found) {
        if (found.price !== t.price) {
          found.price = t.price;
          toSave.push(found);
        }
      } else {
        const newTier = manager.create(ProductPriceTiers, {
          minQuantity: t.minQuantity,
          price: t.price,
          product: isVariant ? null : { id: entity.id },
          variant: isVariant ? { id: entity.id } : null,
        });
        toSave.push(newTier);
      }
    }

    if (toDelete.length) await manager.remove(ProductPriceTiers, toDelete);
    if (toSave.length) await manager.save(ProductPriceTiers, toSave, { chunk: 200 });
  }

  async importPrices(dto: ImportPricesDto) {    
    const errors: RowError[] = [];
    const dryRun = dto.dryRun ?? true;

    const seen = new Set<string>();
    const items: ImportPriceItemDto[] = [];
    for (const it of dto.items) {
      const sku = it.sku.trim();
      if (seen.has(sku)) {
        errors.push({ row: it.row, sku, message: 'SKU تکراری در فایل' });
        continue;
      }
      seen.add(sku);
      items.push({ ...it, sku });
    }

    const skus = items.map((i) => i.sku);

    let updated = 0;
    let unchanged = 0;

    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // بارگذاری با JOIN روابط لازم (product و priceTiers)
      const variants = await qr.manager
        .createQueryBuilder(ProductVariants, 'v')
        .leftJoinAndSelect('v.product', 'product')
        .leftJoinAndSelect('v.priceTiers', 'vTiers')
        .where('TRIM(v.sku) IN (:...skus)', { skus })
        .getMany();

      const products = await qr.manager
        .createQueryBuilder(Products, 'p')
        .leftJoinAndSelect('p.priceTiers', 'pTiers')
        .where('TRIM(p.sku) IN (:...skus)', { skus })
        .getMany();

      const variantMap = new Map(variants.map((v) => [v.sku.trim(), v]));
      const productMap = new Map(products.map((p) => [p.sku.trim(), p]));

      const variantsToSave: ProductVariants[] = [];
      const productsToSave: Products[] = [];
      const parentIdsSet = new Set<number>();
      const tierUpdates: { entity: Owner; tiers: PriceTierDto[] }[] = [];

      for (const it of items) {
        const entity: Owner | undefined =
          variantMap.get(it.sku) ?? productMap.get(it.sku);

        if (!entity) {
          errors.push({ row: it.row, sku: it.sku, message: 'SKU در سیستم یافت نشد' });
          continue;
        }

        if ('type' in entity && entity.type === 'variant') {
          errors.push({
            row: it.row,
            sku: it.sku,
            message: 'این SKU متعلق به محصول دارای واریانت است؛ ردیف واریانت‌ها را ویرایش کنید',
          });
          continue;
        }

        const newPrice = it.price ?? entity.price;
        const newDiscount = it.priceDiscount ?? entity.priceDiscount;

        const priceErr = this.validatePrices(newPrice, newDiscount);
        if (priceErr) {
          errors.push({ row: it.row, sku: it.sku, message: priceErr });
          continue;
        }

        // اعتبارسنجی پله‌های قیمت عمده (در صورت وجود در فایل)
        let tierChanged = false;
        if (it.priceTiers !== undefined) {
          const tierErr = this.validateTiers(it.priceTiers, newPrice);
          if (tierErr) {
            errors.push({ row: it.row, sku: it.sku, message: tierErr });
            continue;
          }
          tierChanged = this.tiersChanged((entity as any).priceTiers ?? [], it.priceTiers);
        }

        const newStock = it.stock ?? entity.stock;
        const newAvail = it.isAvailable ?? entity.isAvailable;

        const fieldsChanged =
          newPrice !== entity.price ||
          newDiscount !== entity.priceDiscount ||
          newStock !== entity.stock ||
          newAvail !== entity.isAvailable;

        if (!fieldsChanged && !tierChanged) {
          unchanged++;
          continue;
        }

        entity.price = newPrice;
        entity.priceDiscount = newDiscount;
        entity.percentageDiscount = this.calcPercent(newPrice, newDiscount);
        entity.stock = newStock;
        entity.isAvailable = newAvail;

        if (entity instanceof ProductVariants) {
          variantsToSave.push(entity);
          if (entity.product?.id) parentIdsSet.add(entity.product.id);
        } else {
          productsToSave.push(entity as Products);
        }

        if (tierChanged) {
          tierUpdates.push({ entity, tiers: it.priceTiers as PriceTierDto[] });
        }

        updated++;
      }

      if (!dryRun) {
        if (variantsToSave.length)
          await qr.manager.save(ProductVariants, variantsToSave, { chunk: 200 });
        if (productsToSave.length)
          await qr.manager.save(Products, productsToSave, { chunk: 200 });

        for (const { entity, tiers } of tierUpdates) {
          await this.syncTiers(qr.manager, entity, tiers);
        }

        for (const pid of parentIdsSet) await this.syncParent(qr.manager, pid);
      }

      if (dryRun) await qr.rollbackTransaction();
      else await qr.commitTransaction();

      return { dryRun, total: dto.items.length, updated, unchanged, errors };
    } catch (e) {
      await qr.rollbackTransaction();
      throw new BadRequestException(`خطا در ایمپورت: ${(e as Error).message}`);
    } finally {
      await qr.release();
    }
  }

  private async syncParent(manager: any, productId: number) {
    const vs: ProductVariants[] = await manager.find(ProductVariants, {
      where: { product: { id: productId } },
      loadEagerRelations: false,
    });
    if (!vs.length) return;

    const effective = (v: ProductVariants) =>
      v.priceDiscount > 0 ? v.priceDiscount : v.price;

    const active = vs.filter((v) => v.isAvailable && v.stock > 0);
    const pool = active.length ? active : vs;
    const cheapest = pool.reduce((a, b) => (effective(a) <= effective(b) ? a : b));

    await manager.update(Products, productId, {
      price: cheapest.price,
      priceDiscount: cheapest.priceDiscount,
      percentageDiscount: this.calcPercent(cheapest.price, cheapest.priceDiscount),
      stock: vs.reduce((s, v) => s + v.stock, 0),
      isAvailable: active.length > 0,
    });
  }
}