import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { TagFilterService } from '../tags/services/tag-filter.service';

export interface ListingFilters {
  search?: string;
  brandId?: number;
  subBrandId?: number;
  /** Already expanded to include sub-categories. */
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  amazing?: boolean;
  tagIds?: number[];
}

export const IN_STOCK_PRODUCT_SQL =
  `((p."type" = 'simple' AND p."stock" > 0) OR (p."type" = 'variant' AND EXISTS (SELECT 1 FROM "product_variants" v WHERE v."productId" = p."id" AND v."deleted_at" IS NULL AND v."isAvailable" = true AND v."stock" > 0)) OR (p."type" = 'bundle' AND p."stock" > 0))`;

/** The price the customer actually pays (discounted price when valid). */
export const EFFECTIVE_PRICE_SQL =
  '(CASE WHEN p.priceDiscount > 0 AND p.priceDiscount < p.price THEN p.priceDiscount ELSE p.price END)';

export const parseBool = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
};

/** One place that knows how to narrow a storefront product query ("p" alias). */
@Injectable()
export class ProductListingFilters {
  constructor(private readonly tagFilter: TagFilterService) {}

  async apply<T extends object>(
    qb: SelectQueryBuilder<T>,
    f: ListingFilters,
    options: { excludeTagGroupId?: number; skipPrice?: boolean } = {},
  ): Promise<void> {
    if (f.search?.trim()) {
      qb.andWhere(
        '(p.title ILIKE :search OR p.englishTitle ILIKE :search OR p.sku ILIKE :search)',
        { search: `%${f.search.trim()}%` },
      );
    }
    if (f.brandId) qb.andWhere('p.brandId = :brandId', { brandId: f.brandId });
    if (f.subBrandId)
      qb.andWhere('p.subBrandId = :subBrandId', { subBrandId: f.subBrandId });
    if (f.categoryIds?.length) {
      qb.andWhere('p.categoryId IN (:...categoryIds)', {
        categoryIds: f.categoryIds,
      });
    }

    if (!options.skipPrice) {
      if (f.minPrice !== undefined && f.minPrice !== null) {
        qb.andWhere(`${EFFECTIVE_PRICE_SQL} >= :minPrice`, {
          minPrice: Number(f.minPrice),
        });
      }
      if (f.maxPrice !== undefined && f.maxPrice !== null) {
        qb.andWhere(`${EFFECTIVE_PRICE_SQL} <= :maxPrice`, {
          maxPrice: Number(f.maxPrice),
        });
      }
    }

    if (f.inStock) qb.andWhere(IN_STOCK_PRODUCT_SQL);
    if (f.onSale)
      qb.andWhere('p.priceDiscount > 0 AND p.priceDiscount < p.price');
    if (f.amazing)
      qb.andWhere('p.isAmazingOffer = :amazing', { amazing: true });

    await this.tagFilter.apply(qb, 'p', f.tagIds ?? [], {
      excludeGroupId: options.excludeTagGroupId,
    });
  }
}
