import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from './entities/products.entity';
import { Categories } from '../categories/entities/categories.entity';
import { Brands } from '../brands/entities/brands.entity';
import { SubBrands } from '../brands/entities/sub-brands.entity';
import { TagGroupsService } from '../tags/services/tag-groups.service';
import { CategoryTreeService } from './category-tree.service';
import { generateSlug } from 'src/common/utils/slug.helper';
import {
  EFFECTIVE_PRICE_SQL,
  IN_STOCK_PRODUCT_SQL,
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
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
    @InjectRepository(Brands)
    private readonly brandRepo: Repository<Brands>,
    @InjectRepository(SubBrands)
    private readonly subBrandRepo: Repository<SubBrands>,
    private readonly tagGroups: TagGroupsService,
    private readonly filters: ProductListingFilters,
    private readonly categoryTree: CategoryTreeService,
  ) {}

  private async resolveBrandIdBySlug(
    rawSlug?: string,
  ): Promise<number | undefined> {
    if (!rawSlug?.trim()) return undefined;
    let decoded = rawSlug.trim();
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // keep raw
    }
    const candidates = Array.from(
      new Set([decoded, generateSlug(decoded)].filter(Boolean)),
    );
    for (const slug of candidates) {
      const brand = await this.brandRepo.findOne({
        where: { slug },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (brand) return brand.id;
    }
    return undefined;
  }

  private async resolveSubBrandIdBySlug(
    rawSlug?: string,
    brandId?: number,
  ): Promise<number | undefined> {
    if (!rawSlug?.trim()) return undefined;
    let decoded = rawSlug.trim();
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // keep raw
    }
    const candidates = Array.from(
      new Set([decoded, generateSlug(decoded)].filter(Boolean)),
    );
    for (const slug of candidates) {
      const subBrand = await this.subBrandRepo.findOne({
        where: brandId ? { slug, brandId } : { slug },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (subBrand) return subBrand.id;
    }
    return undefined;
  }

  private async resolveCategoryIdBySlug(
    rawSlug?: string,
  ): Promise<number | undefined> {
    if (!rawSlug?.trim()) return undefined;
    let decoded = rawSlug.trim();
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // keep raw
    }
    const candidates = Array.from(
      new Set([decoded, generateSlug(decoded)].filter(Boolean)),
    );
    for (const slug of candidates) {
      const cat = await this.categoryRepo.findOne({
        where: { slug },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (cat) return cat.id;
    }
    return undefined;
  }

  async getFacets(
    input: Omit<ListingFilters, 'categoryIds'> & {
      categoryId?: number;
      categorySlug?: string;
      brandSlug?: string;
      subBrandSlug?: string;
    },
  ): Promise<ProductFacets> {
    const {
      categoryId,
      categorySlug,
      brandId,
      brandSlug,
      subBrandId,
      subBrandSlug,
      ...rest
    } = input;
    const resolvedCategoryId =
      categoryId ?? (await this.resolveCategoryIdBySlug(categorySlug));
    const resolvedBrandId =
      brandId ?? (await this.resolveBrandIdBySlug(brandSlug));
    const resolvedSubBrandId =
      subBrandId ??
      (await this.resolveSubBrandIdBySlug(subBrandSlug, resolvedBrandId));
    const filters: ListingFilters = {
      ...rest,
      brandId: resolvedBrandId,
      subBrandId: resolvedSubBrandId,
      categoryIds: resolvedCategoryId
        ? await this.categoryTree.getTreeIds(resolvedCategoryId)
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
      ? `${IN_STOCK_PRODUCT_SQL} AND p."priceDiscount" > 0 AND p."priceDiscount" < p."price"`
      : IN_STOCK_PRODUCT_SQL;
    const onSaleCond = filters.inStock
      ? `p."priceDiscount" > 0 AND p."priceDiscount" < p."price" AND ${IN_STOCK_PRODUCT_SQL}`
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
