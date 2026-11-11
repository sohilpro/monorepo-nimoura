import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from './entities/products.entity';
import { TagGroupsService } from '../tags/services/tag-groups.service';
import { CategoryTreeService } from './category-tree.service';
import {
  EFFECTIVE_PRICE_SQL,
  ListingFilters,
  ProductListingFilters,
} from './product-listing-filters.service';

export interface FacetTag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  count: number;
  selected: boolean;
}

export interface FacetGroup {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  tags: FacetTag[];
}

export interface ProductFacets {
  groups: FacetGroup[];
  price: { min: number; max: number };
  counts: { total: number; inStock: number; onSale: number };
}

/**
 * Filter sidebar data. Counts follow the usual "faceted search" rule: the
 * numbers inside a group ignore that group's own selection, so the shopper
 * can still see what picking another option in the same group would give.
 */
@Injectable()
export class ProductFacetsService {
  constructor(
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    private readonly tagGroups: TagGroupsService,
    private readonly filters: ProductListingFilters,
    private readonly categoryTree: CategoryTreeService,
  ) {}

  async getFacets(
    input: Omit<ListingFilters, 'categoryIds'> & { categoryId?: number },
  ): Promise<ProductFacets> {
    const { categoryId, ...rest } = input;
    const filters: ListingFilters = {
      ...rest,
      categoryIds: categoryId
        ? await this.categoryTree.getTreeIds(categoryId)
        : undefined,
    };
    const selected = new Set(filters.tagIds ?? []);

    const [groups, price, counts] = await Promise.all([
      this.tagGroups.listPublic({ onlyFilterable: true }),
      this.priceRange(filters),
      this.totals(filters),
    ]);

    let sharedCounts: Map<number, number> | null = null;
    if (selected.size === 0 && groups.length > 0) {
      const allTagIds = groups.flatMap((g) => (g.tags ?? []).map((t) => t.id));
      if (allTagIds.length) {
        const qb = this.productRepo
          .createQueryBuilder('p')
          .select('pt.tag_id', 'tagId')
          .addSelect('COUNT(DISTINCT p.id)', 'count')
          .innerJoin('product_tag', 'pt', 'pt.product_id = p.id')
          .where('p.isAvailable = true')
          .andWhere('pt.tag_id IN (:...tagIds)', { tagIds: allTagIds })
          .groupBy('pt.tag_id');
        await this.filters.apply(qb, filters);
        const rows = await qb.getRawMany<{ tagId: number; count: string }>();
        sharedCounts = new Map(
          rows.map((r) => [Number(r.tagId), Number(r.count)]),
        );
      } else {
        sharedCounts = new Map();
      }
    }

    const facetGroups = await Promise.all(
      groups.map(async (group): Promise<FacetGroup> => {
        const tagIds = (group.tags ?? []).map((t) => t.id);
        let groupCounts = sharedCounts;

        if (!groupCounts) {
          if (!tagIds.length) {
            groupCounts = new Map();
          } else {
            const qb = this.productRepo
              .createQueryBuilder('p')
              .select('pt.tag_id', 'tagId')
              .addSelect('COUNT(DISTINCT p.id)', 'count')
              .innerJoin('product_tag', 'pt', 'pt.product_id = p.id')
              .where('p.isAvailable = true')
              .andWhere('pt.tag_id IN (:...tagIds)', { tagIds })
              .groupBy('pt.tag_id');
            await this.filters.apply(qb, filters, {
              excludeTagGroupId: group.id,
            });

            const rows = await qb.getRawMany<{
              tagId: number;
              count: string;
            }>();
            groupCounts = new Map(
              rows.map((r) => [Number(r.tagId), Number(r.count)]),
            );
          }
        }

        return {
          id: group.id,
          name: group.name,
          slug: group.slug,
          icon: group.icon ?? null,
          tags: (group.tags ?? [])
            .map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              color: t.color ?? null,
              count: groupCounts.get(t.id) ?? 0,
              selected: selected.has(t.id),
            }))
            .filter((t) => t.count > 0 || t.selected),
        };
      }),
    );

    return {
      groups: facetGroups.filter((g) => g.tags.length > 0),
      price,
      counts,
    };
  }

  /** Cheapest / most expensive effective price, ignoring the current price filter. */
  private async priceRange(filters: ListingFilters) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .select(`COALESCE(MIN(${EFFECTIVE_PRICE_SQL}), 0)`, 'min')
      .addSelect(`COALESCE(MAX(${EFFECTIVE_PRICE_SQL}), 0)`, 'max')
      .where('p.isAvailable = true');
    await this.filters.apply(qb, filters, { skipPrice: true });
    const row = await qb.getRawOne<{ min: string; max: string }>();
    return { min: Number(row?.min ?? 0), max: Number(row?.max ?? 0) };
  }

  private async totals(filters: ListingFilters) {
    const inStockCond = filters.onSale
      ? 'p."stock" > 0 AND p."priceDiscount" > 0 AND p."priceDiscount" < p."price"'
      : 'p."stock" > 0';
    const onSaleCond = filters.inStock
      ? 'p."priceDiscount" > 0 AND p."priceDiscount" < p."price" AND p."stock" > 0'
      : 'p."priceDiscount" > 0 AND p."priceDiscount" < p."price"';

    const qb = this.productRepo
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'total')
      .addSelect(`COUNT(p.id) FILTER (WHERE ${inStockCond})`, 'inStock')
      .addSelect(`COUNT(p.id) FILTER (WHERE ${onSaleCond})`, 'onSale')
      .where('p.isAvailable = true');

    await this.filters.apply(qb, {
      ...filters,
      inStock: false,
      onSale: false,
    });

    const row = await qb.getRawOne<{
      total: string;
      inStock: string;
      onSale: string;
    }>();

    return {
      total: Number(row?.total ?? 0),
      inStock: Number(row?.inStock ?? 0),
      onSale: Number(row?.onSale ?? 0),
    };
  }
}
