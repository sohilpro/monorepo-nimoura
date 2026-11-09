import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { Products } from './entities/products.entity';
import { BundleItems } from './entities/bundle-items.entity';
import { BundleItemDto } from './dtos/create-bundle.dto';

@Injectable()
export class ProductBundlesService {
  /** Removes every item of a bundle (used when a product stops being a bundle). */
  async clear(manager: EntityManager, bundle: Products): Promise<void> {
    await manager.delete(BundleItems, { bundle: { id: bundle.id } });
    bundle.bundleItems = [];
  }

  /** Replaces the items of a bundle with the given list, after validating them. */
  async sync(
    manager: EntityManager,
    bundle: Products,
    items: BundleItemDto[] | undefined,
  ): Promise<BundleItems[]> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException(
        'برای محصول از نوع پک، حداقل یک آیتم باید به عنوان اقلام پک مشخص شود.',
      );
    }

    const seen = new Set<string>();
    for (const item of items) {
      if (item.productId === bundle.id) {
        throw new BadRequestException('یک پک نمی‌تواند شامل خودش باشد.');
      }
      const key = `${item.productId}:${item.variantId ?? 0}`;
      if (seen.has(key)) {
        throw new BadRequestException('یک محصول/تنوع بیش از یک بار در پک تکرار شده است.');
      }
      seen.add(key);
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const targets = await manager.find(Products, {
      where: { id: In(productIds) },
      relations: { variants: true },
      loadEagerRelations: false,
    });
    const targetById = new Map(targets.map((p) => [p.id, p]));

    const entities = items.map((item) => {
      const target = targetById.get(item.productId);
      if (!target) {
        throw new BadRequestException(
          `محصول با شناسه ${item.productId} برای اقلام پک یافت نشد.`,
        );
      }
      if (target.type === 'bundle') {
        throw new BadRequestException(
          `«${target.title}» خودش یک پک است و نمی‌تواند داخل پک دیگری قرار بگیرد.`,
        );
      }

      const variant = item.variantId
        ? target.variants?.find((v) => v.id === item.variantId)
        : undefined;

      if (item.variantId && !variant) {
        throw new BadRequestException(
          `تنوع انتخاب‌شده متعلق به «${target.title}» نیست.`,
        );
      }
      if (target.type === 'variant' && !variant) {
        throw new BadRequestException(
          `برای «${target.title}» باید یک تنوع مشخص انتخاب شود.`,
        );
      }

      return manager.create(BundleItems, {
        bundle,
        product: target,
        variant,
        quantity: item.quantity,
      });
    });

    await manager.delete(BundleItems, { bundle: { id: bundle.id } });
    bundle.bundleItems = await manager.save(BundleItems, entities);
    return bundle.bundleItems;
  }
}
