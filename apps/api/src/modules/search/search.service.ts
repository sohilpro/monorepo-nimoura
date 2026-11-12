import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SearchProductDto } from './dtos/search-product.dto';
import { Products } from '../products/entities/products.entity';
import { Categories } from '../categories/entities/categories.entity';
import { Brands } from '../brands/entities/brands.entity';
import { SubBrands } from '../brands/entities/sub-brands.entity';
import { SortableColumn, SortOrder } from '../products/dtos/product-query.dto';

interface SearchFilters {
  isAvailable?: boolean;
  inStock?: boolean;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  brandId?: number;
  subBrandId?: number;
  categoryId?: number;
}

const QUICK_THRESHOLD = 0.15;

const SEARCH_EFFECTIVE_PRICE_SQL =
  '(CASE WHEN product."priceDiscount" > 0 AND product."priceDiscount" < product.price THEN product."priceDiscount" ELSE product.price END)';

// فقط فیلدهایی که کارت محصول در لیست نیاز دارد.
// (introduce / howToUse / specifications / shortDescription / توضیحات برند عمداً نیستند)
// اگر کارت محصول فیلد دیگری لازم داشت، همین‌جا اضافه کن.
const PRODUCT_CARD_FIELDS = [
  'product.id',
  'product.title',
  'product.slug',
  'product.thumbnail',
  'product.price',
  'product.priceDiscount',
  'product.percentageDiscount',
  'product.isAvailable',
  'product.stock',
  'product.averageRating',
  'product.ratingsCount',
  'product.isAmazingOffer',
  'brand.id',
  'brand.name',
  'brand.slug',
  'subBrand.id',
  'subBrand.name',
  'subBrand.slug',
];

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
    @InjectRepository(Brands)
    private readonly brandRepo: Repository<Brands>,
    @InjectRepository(SubBrands)
    private readonly subBrandRepo: Repository<SubBrands>,
  ) {}

  // ─────────────────────────────────────────────
  // سرچ کامل محصولات (صفحه‌ی نتایج /search?q=...)
  // فیلتر و مرتب‌سازی دقیقاً مثل ProductFilterQueryDto
  // ─────────────────────────────────────────────
  async searchProducts(dto: SearchProductDto) {
    const {
      q,
      page = 1,
      limit = 12,
      sort,
      sortOrder,
      minPrice,
      maxPrice,
      isAvailable,
      inStock,
      onSale,
      brandId,
      subBrandId,
      categoryId,
      threshold = QUICK_THRESHOLD,
    } = dto;

    const query = q.trim();
    const offset = (page - 1) * limit;
    const filters: SearchFilters = {
      isAvailable,
      inStock,
      onSale,
      minPrice,
      maxPrice,
      brandId,
      subBrandId,
      categoryId,
    };

    // فرمول وزن‌دهی نتایج بر اساس عنوان، ساب‌برند و برند
    const relevanceExpr = `
      (
        CASE WHEN product.title ILIKE :likeQuery THEN 3 ELSE 0 END
        + CASE WHEN subBrand.name ILIKE :likeQuery THEN 2.5 ELSE 0 END
        + CASE WHEN brand.name ILIKE :likeQuery THEN 2 ELSE 0 END
        + CASE WHEN product."englishTitle" ILIKE :likeQuery THEN 1 ELSE 0 END
        + GREATEST(
            similarity(product.title, :query),
            similarity(COALESCE(subBrand.name, ''), :query),
            similarity(COALESCE(brand.name, ''), :query),
            similarity(COALESCE(product."englishTitle", ''), :query),
            similarity(COALESCE(product."shortDescription", ''), :query)
          )
      )
    `;

    const baseQb = () => {
      const qb = this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.brand', 'brand')
        .leftJoin('product.subBrand', 'subBrand')
        .where(
          `(
            product.title ILIKE :likeQuery
            OR product."englishTitle" ILIKE :likeQuery
            OR product."shortDescription" ILIKE :likeQuery
            OR brand.name ILIKE :likeQuery
            OR subBrand.name ILIKE :likeQuery
            OR similarity(product.title, :query) > :threshold
            OR similarity(COALESCE(subBrand.name, ''), :query) > :threshold
            OR similarity(COALESCE(brand.name, ''), :query) > :threshold
            OR similarity(COALESCE(product."englishTitle", ''), :query) > :threshold
            OR similarity(COALESCE(product."shortDescription", ''), :query) > :threshold
          )`,
        )
        .setParameter('query', query)
        .setParameter('likeQuery', `%${query}%`)
        .setParameter('threshold', threshold);

      this.applyFilters(qb, filters);
      return qb;
    };

    const listQb = baseQb()
      .select(PRODUCT_CARD_FIELDS)
      .addSelect(relevanceExpr, 'relevance');
    this.applySorting(listQb, sort, sortOrder);

    const [rawAndEntities, total] = await Promise.all([
      listQb.offset(offset).limit(limit).getRawAndEntities(),
      baseQb().getCount(),
    ]);

    // relevance فقط برای مرتب‌سازی در SQL استفاده می‌شود و به کلاینت نمی‌رود
    const products = rawAndEntities.entities;

    // ساختار پاسخ هم‌شکل بقیه‌ی لیست‌های محصول: products / total / totalPages
    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      query,
    };
  }

  // ─────────────────────────────────────────────
  // سرچ سریع (dropdown سرچ‌بار): محصول + دسته + برند + ساب‌برند
  // ─────────────────────────────────────────────
  async quickSearch(q: string) {
    const query = q?.trim();

    if (!query) {
      return { products: [], categories: [], brands: [], subBrands: [] };
    }

    const [products, categories, brands, subBrands] = await Promise.all([
      this.quickSearchProducts(query, 8),
      this.quickSearchByName(this.categoryRepo, 'category', query, 3, [
        'id',
        'name',
        'slug',
      ]),
      this.quickSearchByName(this.brandRepo, 'brand', query, 3, [
        'id',
        'name',
        'slug',
        'logo',
      ]),
      this.quickSearchSubBrands(query, 4),
    ]);

    return { products, categories, brands, subBrands };
  }

  private async quickSearchProducts(query: string, limit: number) {
    const likeQuery = `%${query}%`;

    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.subBrand', 'subBrand')
      .select([
        'product.id',
        'product.title',
        'product.thumbnail',
        'product.price',
      ])
      .where(
        `(
          product.title ILIKE :likeQuery
          OR product."englishTitle" ILIKE :likeQuery
          OR brand.name ILIKE :likeQuery
          OR subBrand.name ILIKE :likeQuery
          OR similarity(product.title, :query) > :threshold
          OR similarity(COALESCE(subBrand.name, ''), :query) > :threshold
          OR similarity(COALESCE(brand.name, ''), :query) > :threshold
        )`,
      )
      .setParameters({ query, likeQuery, threshold: QUICK_THRESHOLD })
      .orderBy(
        `CASE 
          WHEN product.title ILIKE :likeQuery THEN 0 
          WHEN subBrand.name ILIKE :likeQuery THEN 1
          WHEN brand.name ILIKE :likeQuery THEN 2
          ELSE 3 
        END`,
        'ASC',
      )
      .addOrderBy('similarity(product.title, :query)', 'DESC')
      .limit(limit)
      .getMany();
  }

  // جستجو در ساب‌برندها همراه با مشخصات برند مادر
  private async quickSearchSubBrands(query: string, limit: number) {
    const likeQuery = `%${query}%`;

    return this.subBrandRepo
      .createQueryBuilder('subBrand')
      .leftJoin('subBrand.brand', 'brand')
      .select([
        'subBrand.id',
        'subBrand.name',
        'subBrand.slug',
        'brand.id',
        'brand.name',
        'brand.slug',
        'brand.logo',
      ])
      .where(
        `(subBrand.name ILIKE :likeQuery OR similarity(subBrand.name, :query) > :threshold)`,
      )
      .setParameters({ query, likeQuery, threshold: QUICK_THRESHOLD })
      .orderBy(
        `CASE WHEN subBrand.name ILIKE :likeQuery THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('similarity(subBrand.name, :query)', 'DESC')
      .limit(limit)
      .getMany();
  }

  private async quickSearchByName<T extends { id: any; name: string }>(
    repo: Repository<T>,
    alias: string,
    query: string,
    limit: number,
    fields: string[],
  ) {
    const likeQuery = `%${query}%`;

    return repo
      .createQueryBuilder(alias)
      .select(fields.map((f) => `${alias}.${f}`))
      .where(
        `(${alias}.name ILIKE :likeQuery OR similarity(${alias}.name, :query) > :threshold)`,
      )
      .setParameters({ query, likeQuery, threshold: QUICK_THRESHOLD })
      .orderBy(
        `CASE WHEN ${alias}.name ILIKE :likeQuery THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy(`${alias}.name`, 'ASC')
      .limit(limit)
      .getMany();
  }

  // ─────────────────────────────────────────────
  // مرتب‌سازی: همان مقادیر SORTABLE_COLUMNS
  // بدون sort → بیشترین ارتباط با عبارت جستجو
  // ─────────────────────────────────────────────
  private applySorting(
    qb: SelectQueryBuilder<Products>,
    sort?: SortableColumn,
    sortOrder?: SortOrder,
  ) {
    const dir: SortOrder = sortOrder ?? 'DESC';

    switch (sort) {
      case 'newest':
        qb.orderBy('product.createdAt', 'DESC');
        break;
      case 'cheapest':
        qb.addSelect(SEARCH_EFFECTIVE_PRICE_SQL, 'effective_price').orderBy(
          'effective_price',
          'ASC',
        );
        break;
      case 'expensive':
        qb.addSelect(SEARCH_EFFECTIVE_PRICE_SQL, 'effective_price').orderBy(
          'effective_price',
          'DESC',
        );
        break;
      case 'popular':
        qb.orderBy('product.averageRating', 'DESC').addOrderBy(
          'product.ratingsCount',
          'DESC',
        );
        break;
      case 'title':
        qb.orderBy('product.title', dir);
        break;
      case 'stock':
        qb.orderBy('product.stock', dir);
        break;
      case 'createdAt':
        qb.orderBy('product.createdAt', dir);
        break;
      default:
        // پیش‌فرض جستجو: مرتبط‌ترین
        qb.orderBy('relevance', 'DESC').addOrderBy('product.createdAt', 'DESC');
        return qb.addOrderBy('product.id', 'DESC');
    }

    // ارتباط به‌عنوان دومین معیار، و id برای ثابت ماندن ترتیب بین صفحه‌ها
    // (جلوگیری از تکراری یا جاافتادن آیتم در اسکرول بی‌نهایت)
    return qb.addOrderBy('relevance', 'DESC').addOrderBy('product.id', 'DESC');
  }

  private applyFilters(
    qb: SelectQueryBuilder<Products>,
    filters: SearchFilters,
  ) {
    if (filters.isAvailable !== undefined) {
      qb.andWhere('product."isAvailable" = :isAvailable', {
        isAvailable: filters.isAvailable,
      });
    }
    if (filters.inStock) {
      qb.andWhere('product.stock > 0');
    }
    if (filters.onSale) {
      qb.andWhere(
        'product."priceDiscount" > 0 AND product."priceDiscount" < product.price',
      );
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere(`${SEARCH_EFFECTIVE_PRICE_SQL} >= :minPrice`, {
        minPrice: filters.minPrice,
      });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere(`${SEARCH_EFFECTIVE_PRICE_SQL} <= :maxPrice`, {
        maxPrice: filters.maxPrice,
      });
    }
    if (filters.brandId !== undefined) {
      qb.andWhere('brand.id = :brandId', { brandId: filters.brandId });
    }
    if (filters.subBrandId !== undefined) {
      qb.andWhere('subBrand.id = :subBrandId', {
        subBrandId: filters.subBrandId,
      });
    }
    if (filters.categoryId !== undefined) {
      // ⚠️ فرض: رابطه‌ی ManyToOne با نام product.category
      //    اگر ManyToMany است و اسمش categories است، همین‌جا عوض کن.
      qb.innerJoin('product.category', 'category').andWhere(
        'category.id = :categoryId',
        { categoryId: filters.categoryId },
      );
    }
  }
}
