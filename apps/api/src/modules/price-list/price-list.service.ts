import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Products } from 'src/modules/products/entities/products.entity';
import { Brands } from 'src/modules/brands/entities/brands.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { PriceListQueryDto } from './dtos/price-list-query.dto';
import { PriceListResponse, PriceListRow } from './price-list.types';

// یکسان‌سازی حروف عربی/فارسی برای جستجو
const normalizeFa = (s: string) =>
  s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').trim();

@Injectable()
export class PriceListService {
  constructor(
    @InjectRepository(Products) private readonly products: Repository<Products>,
    @InjectRepository(Brands) private readonly brands: Repository<Brands>,
    @InjectRepository(Categories) private readonly categories: Repository<Categories>,
  ) {}

  async getList(q: PriceListQueryDto): Promise<PriceListResponse> {
    const qb = this.products
      .createQueryBuilder('p')
      // فقط ستون‌های لازم؛ introduce و howToUse که سنگین‌اند لود نمی‌شوند
      .select([
        'p.id', 'p.title', 'p.slug', 'p.sku', 'p.type', 'p.price',
        'p.priceDiscount', 'p.isAvailable', 'p.stock', 'p.updatedAt',
      ])
      .leftJoin('p.brand', 'b').addSelect(['b.id', 'b.name'])
      .leftJoin('p.category', 'c').addSelect(['c.id', 'c.name'])
      .leftJoin('p.priceTiers', 'pt').addSelect(['pt.id', 'pt.minQuantity', 'pt.price'])
      .leftJoin('p.variants', 'v').addSelect([
        'v.id', 'v.sku', 'v.price', 'v.priceDiscount', 'v.isAvailable', 'v.stock', 'v.updatedAt',
      ])
      .leftJoin('v.attributeValues', 'av').addSelect(['av.id', 'av.value'])
      .leftJoin('v.priceTiers', 'vt').addSelect(['vt.id', 'vt.minQuantity', 'vt.price'])
      .orderBy('c.name', 'ASC')
      .addOrderBy('p.title', 'ASC');

    if (q.brandId) qb.andWhere('b.id = :brandId', { brandId: q.brandId });

    if (q.categoryId) {
      // دسته انتخاب‌شده + همه‌ی زیرمجموعه‌ها (CTE بازگشتی)
      qb.andWhere(
        `"p"."categoryId" IN (
           WITH RECURSIVE tree AS (
             SELECT id FROM categories WHERE id = :categoryId
             UNION ALL
             SELECT c2.id FROM categories c2 JOIN tree t ON c2."parentId" = t.id
           ) SELECT id FROM tree)`,
        { categoryId: q.categoryId },
      );
    }

    if (q.search) {
      const s = `%${normalizeFa(q.search)}%`;
      qb.andWhere(
        new Brackets((w) =>
          w.where('p.title ILIKE :s', { s })
            .orWhere('p.englishTitle ILIKE :s', { s })
            .orWhere('p.sku ILIKE :s', { s })
            .orWhere('v.sku ILIKE :s', { s }),
        ),
      );
    }

    const list = await qb.getMany();

    let rows: PriceListRow[] = [];
    let lastUpdated: Date | null = null;
    const touch = (d?: Date) => {
      if (d && (!lastUpdated || d > lastUpdated)) lastUpdated = d;
    };

    for (const p of list) {
      touch(p.updatedAt);
      const base = {
        productId: p.id, slug: p.slug, title: p.title,
        brandId: p.brand?.id ?? null, brand: p.brand?.name ?? '—',
        categoryId: p.category?.id ?? null, category: p.category?.name ?? 'سایر',
      };

      if (p.type === 'variant' && p.variants?.length) {
        const sorted = [...p.variants].sort((a, b) => a.price - b.price);
        for (const v of sorted) {
          touch(v.updatedAt);
          rows.push({
            ...base,
            key: `v-${v.id}`,
            variantLabel: v.attributeValues?.map((a) => a.value).join(' / ') || null,
            sku: v.sku,
            ...this.prices(v.price, v.priceDiscount),
            inStock: v.isAvailable && v.stock > 0,
            tiers: this.tiers(v.priceTiers),
          });
        }
      } else {
        rows.push({
          ...base,
          key: `p-${p.id}`,
          variantLabel: null,
          sku: p.sku,
          ...this.prices(p.price, p.priceDiscount),
          inStock: p.isAvailable && p.stock > 0,
          tiers: this.tiers(p.priceTiers),
        });
      }
    }

    if (q.onlyAvailable) rows = rows.filter((r) => r.inStock);
    if (q.onlyWholesale) rows = rows.filter((r) => r.tiers.length > 0);

    return { rows, meta: { total: rows.length, lastUpdated } };
  }

  async getFilters() {
    const [brands, cats] = await Promise.all([
      this.brands.find({ select: { id: true, name: true }, order: { name: 'ASC' } }),
      this.categories.find({ relations: { parent: true }, order: { name: 'ASC' } }),
    ]);
    return {
      brands,
      categories: cats.map((c) => ({ id: c.id, name: c.name, parentId: c.parent?.id ?? null })),
    };
  }

  private prices(price: number, priceDiscount: number) {
    const hasDiscount = priceDiscount > 0 && priceDiscount < price;
    return {
      price,
      finalPrice: hasDiscount ? priceDiscount : price,
      discountPercent: hasDiscount ? Math.round((1 - priceDiscount / price) * 100) : 0,
    };
  }

  private tiers(t?: { minQuantity: number; price: number }[]) {
    return (t ?? [])
      .map(({ minQuantity, price }) => ({ minQuantity, price }))
      .sort((a, b) => a.minQuantity - b.minQuantity);
  }
}