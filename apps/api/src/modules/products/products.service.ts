// src/modules/products/products.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductImages } from './entities/product-images.entity';
import { ProductVariants } from './entities/product-variants.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import {
  ProductFilterQueryDto,
  PaginationQueryDto,
} from './dtos/product-query.dto';
import { Brands } from '../brands/entities/brands.entity';
import { SubBrands } from '../brands/entities/sub-brands.entity';
import { Categories } from '../categories/entities/categories.entity';
import { TagsService } from 'src/modules/tags/services/tags.service';
import { CategoryTreeService } from './category-tree.service';
import {
  ProductListingFilters,
  parseBool,
} from './product-listing-filters.service';
import {
  buildProductBadges,
  getDiscountPercent,
  getStockStatus,
  ProductBadge,
  StockStatus,
} from './utils/product-badges';
import { buildPagination } from 'src/common/utils/pagination.helper';
import { MediaOwnerType } from '../media/enums/media-owner-type.enum';
import { MediaStaticService } from '../media/media-static.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductVariantsService } from './product-variants.service';
import { ProductBundlesService } from './product-bundles.service';
import { ProductPriceTiers } from './entities/product-price-tiers.entity';
import { getErrorMessage } from 'src/common/utils/error.helper';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 12;

const PRODUCT_CARD_SELECT = [
  'p.id',
  'p.title',
  'p.englishTitle',
  'p.slug',
  'p.sku',
  'p.type',
  'p.price',
  'p.priceDiscount',
  'p.percentageDiscount',
  'p.stock',
  'p.isAvailable',
  'p.isAmazingOffer',
  'p.lowStockThreshold',
  'p.thumbnail',
  'p.averageRating',
  'p.ratingsCount',
  'p.createdAt',
  'p.updatedAt',
  'c.id',
  'c.name',
  'c.slug',
  'b.id',
  'b.name',
  'b.slug',
];

/** Product enriched with computed storefront fields (discount, stock status, badges). */
export type ProductWithBadges = Products & {
  discountPercent: number;
  stockStatus: StockStatus;
  badges: ProductBadge[];
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    @InjectRepository(ProductImages)
    private readonly imageRepo: Repository<ProductImages>,
    @InjectRepository(ProductVariants)
    private readonly variantRepo: Repository<ProductVariants>,
    @InjectRepository(ProductPriceTiers)
    private readonly tierRepo: Repository<ProductPriceTiers>,
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
    @InjectRepository(Brands)
    private readonly brandRepo: Repository<Brands>,
    @InjectRepository(SubBrands)
    private readonly subBrandRepo: Repository<SubBrands>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly mediaService: MediaStaticService,
    private readonly variantsService: ProductVariantsService,
    private readonly bundlesService: ProductBundlesService,
    private readonly tagsService: TagsService,
    private readonly listingFilters: ProductListingFilters,
    private readonly categoryTree: CategoryTreeService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncAmazingOffersDaily() {
    this.logger.log('Starting daily sync for Amazing Offers...');

    try {
      // ۱. محصولاتی که تخفیف دارند: فعال‌سازی شگفت‌انگیز
      // تخفیف یعنی: قیمت تخفیف‌خورده از صفر بیشتر باشد و از قیمت اصلی کمتر باشد
      const activatedResult = await this.productRepo
        .createQueryBuilder()
        .update(Products)
        .set({ isAmazingOffer: true })
        .where('price > 0')
        .andWhere('priceDiscount > 0')
        .andWhere('priceDiscount < price')
        // در صورت نیاز به شرط درصد تخفیف (مثلاً حداقل ۱۰ درصد):
        // .andWhere('((price - priceDiscount)::float / price) * 100 >= :minPercent', { minPercent: 10 })
        .andWhere('isAmazingOffer = :isAmazing', { isAmazing: false })
        .execute();

      // ۲. محصولاتی که دیگر تخفیف ندارند: غیرفعال‌سازی شگفت‌انگیز
      const deactivatedResult = await this.productRepo
        .createQueryBuilder()
        .update(Products)
        .set({ isAmazingOffer: false })
        .where('isAmazingOffer = :isAmazing', { isAmazing: true })
        .andWhere(
          '(priceDiscount <= 0 OR priceDiscount >= price OR priceDiscount IS NULL)',
        )
        .execute();

      this.logger.log(
        `Amazing Offers sync completed. Activated: ${activatedResult.affected || 0}, Deactivated: ${deactivatedResult.affected || 0}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error in syncAmazingOffersDaily: ${getErrorMessage(error)}`,
      );
    }
  }

  // =========================================================================
  // ─── STOREFRONT (بخش عمومی فروشگاه) ──────────────────────────────────────
  // =========================================================================

  private async attachVariants(products: Products[]): Promise<void> {
    if (!products.length) return;

    const productIds = products.map((p) => p.id);

    // واکشی مستقیم با relationId بدون درگیر شدن با اسامی ستون‌های دیتابیس
    const variants = await this.variantRepo
      .createQueryBuilder('pv')
      .select([
        'pv.id',
        'pv.sku',
        'pv.price',
        'pv.priceDiscount',
        'pv.percentageDiscount',
        'pv.stock',
        'pv.isAvailable',
        'pv.images',
        'pv.createdAt',
        'pv.updatedAt',
        'prod.id',
        'av.id',
        'av.value',
        'av.colorHex',
        'attr.id',
        'attr.name',
        'attr.kind',
      ])
      .leftJoin('pv.product', 'prod') // الزامی برای دریافت شناسه محصول
      .leftJoin('pv.attributeValues', 'av')
      .leftJoin('av.attribute', 'attr')
      .where('prod.id IN (:...productIds)', { productIds })
      .orderBy('pv.id', 'ASC')
      .getMany();

    const variantMap = new Map<number, ProductVariants[]>();

    for (const variant of variants) {
      const prodId = variant.product?.id;
      if (prodId) {
        if (!variantMap.has(prodId)) {
          variantMap.set(prodId, []);
        }
        variantMap.get(prodId)!.push(variant);
      }
    }
    for (const variant of variants) {
      delete (variant as Partial<ProductVariants>).product; // جلوگیری از Circular JSON و تکرار داده‌ها
    }

    // متصل کردن واریانت‌ها به هر محصول
    for (const product of products) {
      product.variants = variantMap.get(product.id) || [];
    }
  }

  /**
   * الصاق پله‌های قیمت عمده‌ی محصول و واریانت‌ها (یک کوئری برای کل صفحه، بدون N+1).
   * ⚠️ باید «بعد از» attachVariants اجرا شود چون به id واریانت‌ها نیاز دارد.
   */
  private async attachPriceTiers(products: Products[]): Promise<void> {
    if (!products.length) return;

    const pids = products.map((p) => p.id);
    const vids = products.flatMap((p) => (p.variants ?? []).map((v) => v.id));

    const conds = ['tp.id IN (:...pids)'];
    if (vids.length) conds.push('tv.id IN (:...vids)');

    const rows = await this.tierRepo
      .createQueryBuilder('t')
      .select(['t.id', 't.minQuantity', 't.price', 'tp.id', 'tv.id'])
      .leftJoin('t.product', 'tp')
      .leftJoin('t.variant', 'tv')
      .where(conds.join(' OR '), { pids, vids })
      .orderBy('t.minQuantity', 'ASC')
      .getMany();

    const byProduct = new Map<number, ProductPriceTiers[]>();
    const byVariant = new Map<number, ProductPriceTiers[]>();

    const push = (
      map: Map<number, ProductPriceTiers[]>,
      key: number,
      t: ProductPriceTiers,
    ) => {
      const arr = map.get(key) ?? [];
      // فقط فیلدهای لازم؛ بدون product/variant تا چرخه‌ی JSON ایجاد نشود
      arr.push({
        id: t.id,
        minQuantity: t.minQuantity,
        price: t.price,
      } as ProductPriceTiers);
      map.set(key, arr);
    };

    for (const t of rows) {
      if (t.product) push(byProduct, t.product.id, t);
      if (t.variant) push(byVariant, t.variant.id, t);
    }

    for (const p of products) {
      p.priceTiers = byProduct.get(p.id) ?? [];
      for (const v of p.variants ?? []) {
        v.priceTiers = byVariant.get(v.id) ?? [];
      }
    }
  }

  /**
   * دریافت لیست عمومی تمام محصولات به همراه واریانت‌ها و پله‌های قیمت عمده
   */
  async findAllActive(query: ProductFilterQueryDto) {
    const page = Math.max(query.page ?? 1, 1);
    const limit = this.sanitizeLimit(query.limit);
    const { sort = 'newest' } = query;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .select(PRODUCT_CARD_SELECT)
      .leftJoin('p.category', 'c')
      .leftJoin('p.brand', 'b')
      .where('p.isAvailable = :isAvailable', { isAvailable: true });

    await this.listingFilters.apply(qb, {
      search: query.search,
      brandId: query.brandId,
      subBrandId: query.subBrandId,
      categoryIds: query.categoryId
        ? await this.categoryTree.getTreeIds(query.categoryId)
        : undefined,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: parseBool(query.inStock),
      onSale: query.onSale,
      tagIds: query.tags,
    });

    this.applySorting(qb, sort);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // الصاق موازی تصاویر و واریانت‌ها؛ سپس پله‌های قیمت (وابسته به واریانت‌ها)
    await Promise.all([this.attachImages(items), this.attachVariants(items)]);
    await this.attachPriceTiers(items);

    return {
      products: this.calculateDiscounts(items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * دریافت لیست تمام محصولات برای پنل مدیریت (شامل فعال و غیرفعال، جستجوی شناسه/عنوان/کد و مرتب‌سازی دلخواه)
   */
  async findAllForAdmin(query: ProductFilterQueryDto) {
    const page = Math.max(query.page ?? 1, 1);
    const limit = this.sanitizeLimit(query.limit);
    const {
      search,
      brandId,
      categoryId,
      subBrandId,
      sort = 'createdAt',
      sortOrder = 'DESC',
      isAvailable,
    } = query;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .select([
        ...PRODUCT_CARD_SELECT,
        'sb.id',
        'sb.name',
        'sb.slug',
        'sb.brandId',
      ])
      .leftJoin('p.category', 'c')
      .leftJoin('p.brand', 'b')
      .leftJoin('p.subBrand', 'sb');

    if (isAvailable !== undefined && isAvailable !== '') {
      const boolVal =
        isAvailable === true ||
        isAvailable === 'true' ||
        isAvailable === '1' ||
        isAvailable === 1;
      qb.andWhere('p.isAvailable = :isAvailable', { isAvailable: boolVal });
    }

    if (search && String(search).trim()) {
      const s = String(search).trim();
      const numId = Number(s);
      if (!Number.isNaN(numId) && Number.isInteger(numId) && numId > 0) {
        qb.andWhere(
          '(p.id = :numId OR p.title ILIKE :search OR p.englishTitle ILIKE :search OR p.sku ILIKE :search)',
          { numId, search: `%${s}%` },
        );
      } else {
        qb.andWhere(
          '(p.title ILIKE :search OR p.englishTitle ILIKE :search OR p.sku ILIKE :search)',
          { search: `%${s}%` },
        );
      }
    }

    if (brandId) {
      qb.andWhere('p.brandId = :brandId', { brandId });
    }

    if (categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId });
    }

    if (subBrandId) {
      qb.andWhere('p.subBrandId = :subBrandId', { subBrandId });
    }

    // مرتب‌سازی پویا بر اساس ستون‌های مجاز
    const allowedSortFields: Record<string, string> = {
      id: 'p.id',
      title: 'p.title',
      price: 'p.price',
      priceDiscount: 'p.priceDiscount',
      stock: 'p.stock',
      createdAt: 'p.createdAt',
      updatedAt: 'p.updatedAt',
      averageRating: 'p.averageRating',
    };

    const sortColumn = allowedSortFields[sort] || 'p.createdAt';
    const direction =
      String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortColumn, direction);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // الصاق بهینه تصاویر و تنوع‌ها
    await Promise.all([this.attachImages(items), this.attachVariants(items)]);

    const totalPages = Math.ceil(total / limit);
    const discountedItems = this.calculateDiscounts(items);

    return {
      items: discountedItems,
      products: discountedItems, // حفظ سازگاری
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * دسته‌بندی‌ها و برندهایی که حداقل یک محصول فعال دارند (برای فیلتر کاتالوگ)
   */
  async getCatalogFilters() {
    const base = () =>
      this.productRepo
        .createQueryBuilder('p')
        .where('p.isAvailable = :a', { a: true });

    const [categories, brands] = await Promise.all([
      base()
        .innerJoin('p.category', 'c')
        .select('c.id', 'id')
        .addSelect('c.name', 'name')
        .addSelect('COUNT(p.id)', 'count')
        .groupBy('c.id')
        .addGroupBy('c.name')
        .orderBy('count', 'DESC')
        .getRawMany<{ id: string; name: string; count: string }>(),
      base()
        .innerJoin('p.brand', 'b')
        .select('b.id', 'id')
        .addSelect('b.name', 'name')
        .addSelect('COUNT(p.id)', 'count')
        .groupBy('b.id')
        .addGroupBy('b.name')
        .orderBy('count', 'DESC')
        .getRawMany<{ id: string; name: string; count: string }>(),
    ]);

    const toNum = (r: { id: string; name: string; count: string }) => ({
      id: Number(r.id),
      name: r.name,
      count: Number(r.count),
    });
    return { categories: categories.map(toNum), brands: brands.map(toNum) };
  }

  /**
   * محصولات فعالی که قیمت عمده دارند (پله‌ی خود محصول یا یکی از واریانت‌ها) - با صفحه‌بندی
   */
  async findWholesale(query: PaginationQueryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = this.sanitizeLimit(query.limit);

    // ۱. پله‌ها را بگیر و id محصولِ صاحبشان را (مستقیم یا از طریق واریانت) دربیاور
    const tiers = await this.tierRepo
      .createQueryBuilder('t')
      .leftJoin('t.product', 'tp')
      .addSelect('tp.id')
      .leftJoin('t.variant', 'tv')
      .addSelect('tv.id')
      .leftJoin('tv.product', 'tvp')
      .addSelect('tvp.id')
      .getMany();

    const ids = [
      ...new Set(
        tiers
          .map((t) => t.product?.id ?? t.variant?.product?.id)
          .filter((id): id is number => typeof id === 'number'),
      ),
    ];

    const emptyMeta = { total: 0, page, limit, totalPages: 0 };
    if (!ids.length) return { products: [], meta: emptyMeta };

    // ۲. خود محصولات
    const [items, total] = await this.productRepo
      .createQueryBuilder('p')
      .select(PRODUCT_CARD_SELECT)
      .leftJoin('p.category', 'c')
      .leftJoin('p.brand', 'b')
      .where('p.id IN (:...ids)', { ids })
      .andWhere('p.isAvailable = :a', { a: true })
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    await Promise.all([this.attachImages(items), this.attachVariants(items)]);
    await this.attachPriceTiers(items);

    return {
      products: this.calculateDiscounts(items),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * دریافت محصولات شگفت‌انگیز
   */
  async findAmazing(query: PaginationQueryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = this.sanitizeLimit(query.limit, 10);
    const { minPrice, maxPrice } = query;

    // تاریخ امروز به عنوان Seed روزانه
    const todaySeed = new Date().toISOString().split('T')[0];

    const qb = this.productRepo
      .createQueryBuilder('p')
      .select(PRODUCT_CARD_SELECT)
      .leftJoin('p.category', 'c')
      .leftJoin('p.brand', 'b')
      // ۱. اضافه کردن فرمول شافل به عنوان فیلد محاسباتی
      .addSelect(`md5(concat(p.id, '${todaySeed}'))`, 'daily_shuffle')
      .where('p.isAmazingOffer = :amazing', { amazing: true })
      .andWhere('p.isAvailable = :available', { available: true })
      .andWhere(
        '( (p.type = :simple AND p.stock > 0) OR (p.type = :variant AND EXISTS (SELECT 1 FROM "product_variants" v WHERE v."productId" = p.id AND v.deleted_at IS NULL AND v.stock > 0)) OR (p.type = :bundle) )',
        {
          simple: 'simple',
          variant: 'variant',
          bundle: 'bundle',
        },
      );

    // ۲. فیلتر حداقل قیمت (هم برای محصول ساده هم واریانت‌ها)
    if (minPrice !== undefined && minPrice !== null) {
      qb.andWhere(
        '( (p.type = :simple AND p.price >= :minPrice) OR (p.type = :variant AND EXISTS (SELECT 1 FROM "product_variants" v_min WHERE v_min."productId" = p.id AND v_min.deleted_at IS NULL AND v_min.price >= :minPrice)) )',
        { minPrice: Number(minPrice) },
      );
    }

    // ۳. فیلتر حداکثر قیمت (هم برای محصول ساده هم واریانت‌ها)
    if (maxPrice !== undefined && maxPrice !== null) {
      qb.andWhere(
        '( (p.type = :simple AND p.price <= :maxPrice) OR (p.type = :variant AND EXISTS (SELECT 1 FROM "product_variants" v_max WHERE v_max."productId" = p.id AND v_max.deleted_at IS NULL AND v_max.price <= :maxPrice)) )',
        { maxPrice: Number(maxPrice) },
      );
    }

    // ۴. مرتب‌سازی بر اساس نام مستعار تعریف‌شده
    qb.orderBy('daily_shuffle', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    await Promise.all([this.attachImages(items), this.attachVariants(items)]);

    // ۵. اعمال تخفیف‌ها قبل از ارسال به صفحه‌بندی
    const productsWithDiscounts = this.calculateDiscounts(items);

    // ۶. ساختاردهی خروجی بر اساس buildPagination
    return buildPagination(
      [productsWithDiscounts, total],
      page,
      limit,
      'products',
    );
  }

  /**
   * دریافت محصولات بر اساس برند و زیربرند
   */
  async findByBrand(
    brandIdentifier: number | string,
    query: ProductFilterQueryDto = {},
  ) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = this.sanitizeLimit(query.limit);
    const {
      search,
      sort = 'newest',
      isAvailable,
      categoryId,
      minPrice,
      maxPrice,
      subBrandId,
    } = query;

    // ۱. دریافت برند اصلی
    const isNumericBrand = !isNaN(Number(brandIdentifier));
    const brandRepo = this.productRepo.manager.getRepository(Brands);
    const subBrandRepo = this.productRepo.manager.getRepository(SubBrands);

    const brand = await brandRepo.findOne({
      where: isNumericBrand
        ? { id: Number(brandIdentifier) }
        : { slug: String(brandIdentifier).trim() },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
      },
      loadEagerRelations: false,
    });

    if (!brand) {
      throw new NotFoundException('برند مورد نظر یافت نشد');
    }

    // ۲. در صورت وجود subBrandId، دریافت اطلاعات زیربرند مربوطه
    let activeSubBrand: SubBrands | null = null;
    if (subBrandId) {
      activeSubBrand = await subBrandRepo.findOne({
        where: { id: Number(subBrandId), brandId: brand.id },
        select: { id: true, name: true, slug: true },
        loadEagerRelations: false,
      });
    }

    // ۳. ساخت QueryBuilder برای محصولات
    const qb = this.productRepo
      .createQueryBuilder('p')
      .select([
        ...PRODUCT_CARD_SELECT,
        'sb.id',
        'sb.name',
        'sb.slug',
        'sb.brandId',
      ])
      .leftJoin('p.brand', 'b')
      .leftJoin('p.subBrand', 'sb')
      .leftJoin('p.category', 'c');

    // فیلتر بر اساس برند اصلی پیدا شده
    qb.where('p.brandId = :brandId', { brandId: brand.id });

    // فیلتر ساب‌برند
    if (subBrandId) {
      qb.andWhere('p.subBrandId = :subBrandId', {
        subBrandId: Number(subBrandId),
      });
    }

    // فیلتر موجودی
    if (typeof isAvailable === 'boolean') {
      qb.andWhere('p.isAvailable = :isAvailable', { isAvailable });
    }

    // فیلتر حداقل قیمت
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      qb.andWhere(
        '( (p.type = :simple AND p.price >= :minPrice) OR (p.type = :variant AND EXISTS (SELECT 1 FROM "product_variants" v_min WHERE v_min."productId" = p.id AND v_min.deleted_at IS NULL AND v_min.price >= :minPrice)) )',
        { minPrice: Number(minPrice), simple: 'simple', variant: 'variant' },
      );
    }

    // فیلتر حداکثر قیمت
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      qb.andWhere(
        '( (p.type = :simple AND p.price <= :maxPrice) OR (p.type = :variant AND EXISTS (SELECT 1 FROM "product_variants" v_max WHERE v_max."productId" = p.id AND v_max.deleted_at IS NULL AND v_max.price <= :maxPrice)) )',
        { maxPrice: Number(maxPrice), simple: 'simple', variant: 'variant' },
      );
    }

    // فیلتر دسته‌بندی
    if (categoryId) {
      qb.andWhere('p.categoryId = :categoryId', {
        categoryId: Number(categoryId),
      });
    }

    // جستجو در عنوان
    if (search) {
      qb.andWhere('(p.title ILIKE :search OR p.englishTitle ILIKE :search)', {
        search: `%${search.trim()}%`,
      });
    }

    this.applySorting(qb, sort);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    await Promise.all([this.attachImages(items), this.attachVariants(items)]);

    const productsWithDiscounts = this.calculateDiscounts(items);

    const result = buildPagination(
      [productsWithDiscounts, total],
      page,
      limit,
      'products',
    );

    // ۴. ساخت ساختار خروجی شامل برند اصلی و زیربرند فعال (جهت استفاده در بریدکرامب فرانت)
    return {
      products: productsWithDiscounts, // 🟢 صریحاً کلید products را اضافه کنید
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
        subBrand: activeSubBrand
          ? {
              id: activeSubBrand.id,
              name: activeSubBrand.name,
              slug: activeSubBrand.slug,
            }
          : null,
      },
    };
  }

  /**
   * دریافت محصولات یک دسته‌بندی (به همراه تمام فرزندان آن در درخت)
   */
  async findByCategory(categoryId: number, query: ProductFilterQueryDto = {}) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = this.sanitizeLimit(query.limit);
    const { sort = 'newest' } = query;

    // ۱. پیدا کردن خودِ دسته‌بندی اصلی همراه با والدش جهت ساخت بریدکرامب
    const categoryRepo = this.productRepo.manager.getRepository(Categories);
    const currentCategory = await categoryRepo.findOne({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        seoText: true,
        parent: {
          id: true,
          name: true,
          slug: true,
          parent: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      relations: {
        parent: {
          parent: true, // لایه دوم والد
        },
      },
      loadEagerRelations: false,
    });

    if (!currentCategory) {
      throw new NotFoundException('دسته‌بندی مورد نظر یافت نشد');
    }

    // ۲. شناسه این دسته‌بندی و تمام زیردسته‌های آن
    const ids = await this.categoryTree.getTreeIds(categoryId);
    if (!ids.length) {
      const emptyResult = buildPagination([[], 0], page, limit, 'products');
      return {
        products: [],
        ...emptyResult,
        category: currentCategory,
      };
    }

    const qb = this.productRepo
      .createQueryBuilder('p')
      .select(PRODUCT_CARD_SELECT)
      .leftJoin('p.category', 'c')
      .leftJoin('p.brand', 'b')
      .where('p.isAvailable = :active', { active: true });

    await this.listingFilters.apply(qb, {
      search: query.search,
      brandId: query.brandId,
      subBrandId: query.subBrandId,
      categoryIds: ids,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      // سایت قدیمی پارامتر isAvailable را برای «فقط کالاهای موجود» می‌فرستد
      inStock: parseBool(query.inStock) || parseBool(query.isAvailable),
      onSale: query.onSale,
      tagIds: query.tags,
    });

    this.applySorting(qb, sort);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // اضافه کردن تصاویر و محاسبه تخفیف‌ها
    await this.attachImages(items);
    const productsWithDiscounts = this.calculateDiscounts(items);

    const result = buildPagination(
      [productsWithDiscounts, total],
      page,
      limit,
      'products',
    );

    // ۳. خروجی صریح شامل کلید products و اطلاعات کامل category برای سئو و بریدکرامب
    return {
      products: productsWithDiscounts,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      category: {
        id: currentCategory.id,
        name: currentCategory.name,
        slug: currentCategory.slug,
        seoText: currentCategory.seoText,
        parent: currentCategory.parent
          ? {
              id: currentCategory.parent.id,
              name: currentCategory.parent.name,
              slug: currentCategory.parent.slug,
              parent: currentCategory.parent.parent
                ? {
                    id: currentCategory.parent.parent.id,
                    name: currentCategory.parent.parent.name,
                    slug: currentCategory.parent.parent.slug,
                  }
                : null,
            }
          : null,
      },
    };
  }

  /**
   * واکشی تکی با شناسه
   */
  async findById(id: number): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        englishTitle: true,
        slug: true,
        sku: true,
        type: true,
        price: true,
        priceDiscount: true,
        percentageDiscount: true,
        stock: true,
        lowStockThreshold: true,
        isAvailable: true,
        isAmazingOffer: true,
        thumbnail: true,
        shortDescription: true,
        introduce: true,
        howToUse: true,
        specifications: true,
        averageRating: true,
        ratingsCount: true,
        createdAt: true,
        updatedAt: true,
        category: {
          id: true,
          name: true,
          slug: true,
          parent: {
            id: true,
            name: true,
            slug: true,
            parent: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        brand: { id: true, name: true, slug: true },
        subBrand: { id: true, name: true, slug: true, brandId: true },
        tags: {
          id: true,
          name: true,
          slug: true,
          color: true,
          isActive: true,
          group: { id: true, name: true, slug: true, isActive: true },
        },
        images: { id: true, url: true },
        variants: {
          id: true,
          sku: true,
          price: true,
          priceDiscount: true,
          percentageDiscount: true,
          stock: true,
          isAvailable: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          attributeValues: {
            id: true,
            value: true,
            colorHex: true,
            attribute: { id: true, name: true, kind: true },
          },
        },
        bundleItems: {
          id: true,
          quantity: true,
          product: {
            id: true,
            title: true,
            thumbnail: true,
            sku: true,
            type: true,
            price: true,
            priceDiscount: true,
          },
          variant: {
            id: true,
            sku: true,
            price: true,
            priceDiscount: true,
            attributeValues: { id: true, value: true, colorHex: true },
          },
        },
      },
      relations: {
        category: {
          parent: {
            parent: true,
          },
        },
        brand: true,
        subBrand: true,
        tags: { group: true },
        images: true,
        variants: {
          attributeValues: {
            attribute: true,
          },
        },
        bundleItems: {
          product: true,
          variant: { attributeValues: true },
        },
      },
      loadEagerRelations: false,
      order: { variants: { id: 'ASC' } },
    });

    if (!product) {
      throw new NotFoundException('محصول یافت نشد');
    }

    return product;
  }

  /**
   * واکشی تکی با اسلاگ (SEO-Friendly)
   */
  async findBySlug(slug: string): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { slug },
      select: {
        id: true,
        title: true,
        englishTitle: true,
        slug: true,
        sku: true,
        type: true,
        price: true,
        priceDiscount: true,
        percentageDiscount: true,
        stock: true,
        lowStockThreshold: true,
        isAvailable: true,
        isAmazingOffer: true,
        thumbnail: true,
        shortDescription: true,
        introduce: true,
        howToUse: true,
        specifications: true,
        averageRating: true,
        ratingsCount: true,
        createdAt: true,
        updatedAt: true,
        category: { id: true, name: true, slug: true },
        brand: { id: true, name: true, slug: true },
        subBrand: { id: true, name: true, slug: true, brandId: true },
        tags: {
          id: true,
          name: true,
          slug: true,
          color: true,
          isActive: true,
          group: { id: true, name: true, slug: true, isActive: true },
        },
        images: { id: true, url: true },
        priceTiers: { id: true, minQuantity: true, price: true },
        variants: {
          id: true,
          sku: true,
          price: true,
          priceDiscount: true,
          percentageDiscount: true,
          stock: true,
          isAvailable: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          attributeValues: {
            id: true,
            value: true,
            colorHex: true,
            attribute: { id: true, name: true, kind: true },
          },
          priceTiers: { id: true, minQuantity: true, price: true },
        },
      },
      relations: {
        category: true,
        brand: true,
        subBrand: true,
        tags: { group: true },
        images: true,
        variants: {
          attributeValues: { attribute: true },
          priceTiers: true, // لود پله‌های هر واریانت
        },
        priceTiers: true, // لود پله‌های محصول ساده
      },
      loadEagerRelations: false,
      order: {
        priceTiers: {
          minQuantity: 'ASC', // سورت صعودی برای سهولت کار کلاینت و فرمول محاسبه
        },
        variants: {
          priceTiers: {
            minQuantity: 'ASC',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('محصول یافت نشد');
    }

    return product;
  }

  /**
   * دریافت محصولات مشابه (همان دسته‌بندی)
   */
  async findSimilarProducts(
    productId: number,
    limit = 8,
  ): Promise<ProductWithBadges[]> {
    const current = await this.productRepo.findOne({
      where: { id: productId },
      select: { id: true, category: { id: true } },
      relations: { category: true },
      loadEagerRelations: false,
    });

    if (!current?.category?.id) {
      return [];
    }

    const products = await this.randomSample(
      this.productRepo
        .createQueryBuilder('p')
        .select(PRODUCT_CARD_SELECT)
        .innerJoin('p.category', 'c')
        .leftJoin('p.brand', 'b')
        .where('c.id = :categoryId', {
          categoryId: current.category.id,
        })
        .andWhere('p.id != :id', {
          id: productId,
        })
        .andWhere('p.isAvailable = :available', {
          available: true,
        }),
      limit,
    );

    await this.attachImages(products);

    return this.calculateDiscounts(products);
  }

  /**
   * دریافت محصولات مکمل (همان برند)
   */
  async findRelatedProducts(
    productId: number,
    limit = 8,
  ): Promise<ProductWithBadges[]> {
    const current = await this.productRepo.findOne({
      where: { id: productId },
      select: { id: true, brand: { id: true } },
      relations: { brand: true },
      loadEagerRelations: false,
    });

    if (!current?.brand?.id) {
      return [];
    }

    const brandId = current.brand.id;

    const products = await this.randomSample(
      this.productRepo
        .createQueryBuilder('p')
        .select(PRODUCT_CARD_SELECT)
        .leftJoin('p.category', 'c')
        .innerJoin('p.brand', 'b')
        .where('b.id = :brandId', { brandId })
        .andWhere('p.id != :id', { id: productId })
        .andWhere('p.isAvailable = :available', { available: true }),
      limit,
    );

    await this.attachImages(products);

    return this.calculateDiscounts(products);
  }

  // =========================================================================
  // ─── ADMIN PANEL (بخش مدیریت و ویرایش) ───────────────────────────────────
  // =========================================================================

  async create(
    dto: CreateProductDto,
    thumbnailFile?: Express.Multer.File,
    imageFiles: Express.Multer.File[] = [],
  ): Promise<Products> {
    const {
      categoryId,
      brandId,
      subBrandId,
      variants,
      tagIds,
      bundleItems,
      images: rawGalleryUrls,
      specifications: rawSpecs,
      ...rest
    } = dto;

    // ۱. بررسی صحت روابط پایه (دسته‌بندی، برند و زیربرند)
    const [category, brand, subBrand] = await Promise.all([
      categoryId
        ? this.categoryRepo.findOne({
            where: { id: categoryId },
            select: { id: true, name: true, slug: true },
            loadEagerRelations: false,
          })
        : null,
      brandId
        ? this.brandRepo.findOne({
            where: { id: brandId },
            select: { id: true, name: true, slug: true },
            loadEagerRelations: false,
          })
        : null,
      subBrandId
        ? this.subBrandRepo.findOne({
            where: { id: subBrandId },
            select: { id: true, name: true, slug: true, brandId: true },
            loadEagerRelations: false,
          })
        : null,
    ]);

    if (categoryId && !category)
      throw new NotFoundException('دسته‌بندی یافت نشد');
    if (brandId && !brand) throw new NotFoundException('برند یافت نشد');
    if (subBrandId && !subBrand)
      throw new NotFoundException('زیربرند یافت نشد');

    const resolvedTags = Array.isArray(tagIds)
      ? await this.tagsService.findActiveByIdsOrFail(tagIds)
      : [];

    this.assertDiscountValid(rest.price, rest.priceDiscount);

    // پاکسازی امن مشخصات فنی
    const cleanSpecifications = Array.isArray(rawSpecs)
      ? rawSpecs
          .flat()
          .filter((item) => item && typeof item === 'object' && item.key)
          .map((item) => ({
            key: String(item.key).trim(),
            value: String(item.value ?? '').trim(),
          }))
      : [];

    let savedProduct: Products;
    let thumbnailUrl: string | undefined;
    let uploadedGalleryUrls: string[] = [];
    const uploadedMediaIds: number[] = [];

    const initialGalleryUrls = Array.isArray(rawGalleryUrls)
      ? rawGalleryUrls.filter((u) => typeof u === 'string' && u.trim() !== '')
      : [];

    try {
      savedProduct = await this.dataSource.transaction(async (manager) => {
        // الف) ایجاد و ذخیره انتیتی اصلی محصول
        const product = manager.create(Products, {
          ...rest,
          thumbnail: rest.thumbnail,
          specifications: cleanSpecifications,
          slug: this.generateSlug(dto.title),
          category: category ?? undefined,
          brand: brand ?? undefined,
          subBrand: subBrand ?? undefined,
          tags: resolvedTags,
        });

        const newProduct = await manager.save(Products, product);

        // ب) تنوع‌ها (حجمی/وزنی/رنگی)؛ قیمت و موجودی محصول از تنوع‌ها مشتق می‌شود
        if (newProduct.type === 'variant') {
          newProduct.variants = await this.variantsService.sync(
            manager,
            newProduct,
            [],
            variants ?? [],
          );
          const pricing = this.variantsService.derivePricing(
            newProduct.variants,
          );
          await manager.update(Products, newProduct.id, pricing);
          Object.assign(newProduct, pricing);
        }

        // ج) اقلام پک (باندل)
        if (newProduct.type === 'bundle') {
          await this.bundlesService.sync(manager, newProduct, bundleItems);
        }

        // هـ) ثبت تصاویر گالری اولیه
        if (initialGalleryUrls.length > 0) {
          const imageEntities = initialGalleryUrls.map((url: string) =>
            manager.create(ProductImages, {
              product: newProduct,
              url,
            }),
          );
          newProduct.images = await manager.save(ProductImages, imageEntities);
        }

        return newProduct;
      });
    } catch (dbError: unknown) {
      if (dbError instanceof BadRequestException) throw dbError;
      throw new InternalServerErrorException(
        'خطا در ایجاد رکورد محصول در پایگاه داده: ' + getErrorMessage(dbError),
      );
    }

    // ۲. اتصال تصاویر به مدیا منیجر
    const productIdStr = String(savedProduct.id);

    if (rest.thumbnail) {
      await this.mediaService.reassignOwner(
        [rest.thumbnail],
        MediaOwnerType.PRODUCT_THUMBNAIL,
        productIdStr,
      );
    }

    if (initialGalleryUrls.length > 0) {
      await this.mediaService.reassignOwner(
        initialGalleryUrls,
        MediaOwnerType.PRODUCT_GALLERY,
        productIdStr,
      );
    }

    // ۳. هندل آپلود مستقیم مالتر
    try {
      if (thumbnailFile) {
        const uploadedThumb = await this.mediaService.upload(thumbnailFile, {
          ownerType: MediaOwnerType.PRODUCT_THUMBNAIL,
          ownerId: productIdStr,
        });
        thumbnailUrl = uploadedThumb.publicUrl;
        uploadedMediaIds.push(uploadedThumb.id);
      }

      if (imageFiles.length > 0) {
        const uploadedGallery = await this.mediaService.uploadMany(imageFiles, {
          ownerType: MediaOwnerType.PRODUCT_GALLERY,
          ownerId: productIdStr,
        });
        uploadedGalleryUrls = uploadedGallery.map((m) => m.publicUrl);
        uploadedMediaIds.push(...uploadedGallery.map((m) => m.id));
      }

      if (thumbnailUrl || uploadedGalleryUrls.length > 0) {
        await this.dataSource.transaction(async (manager) => {
          if (thumbnailUrl) {
            savedProduct.thumbnail = thumbnailUrl;
          }

          if (uploadedGalleryUrls.length > 0) {
            const extraImageEntities = uploadedGalleryUrls.map((url) =>
              manager.create(ProductImages, {
                product: savedProduct,
                url,
              }),
            );
            const savedExtraImages = await manager.save(
              ProductImages,
              extraImageEntities,
            );
            savedProduct.images = [
              ...(savedProduct.images || []),
              ...savedExtraImages,
            ];
          }

          await manager.save(Products, savedProduct);
        });
      }

      return this.cleanCircularReferences(savedProduct);
    } catch (uploadOrUpdateError: unknown) {
      await this.productRepo.remove(savedProduct).catch(() => {});
      for (const mediaId of uploadedMediaIds) {
        await this.mediaService.deleteById(mediaId).catch(() => {});
      }

      throw new InternalServerErrorException(
        'خطا در پردازش و ذخیره تصاویر محصول: ' +
          getErrorMessage(uploadOrUpdateError),
      );
    }
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    thumbnailFile?: Express.Multer.File,
    imageFiles: Express.Multer.File[] = [],
  ): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        images: true,
        variants: {
          attributeValues: {
            attribute: true,
          },
        },
        category: true,
        brand: true,
        subBrand: true,
        tags: true,
      },
    });

    if (!product) throw new NotFoundException('محصول یافت نشد');

    const {
      categoryId,
      brandId,
      subBrandId,
      imagesToDelete,
      images: incomingGallery,
      variants,
      tagIds,
      removeOldThumbnail,
      specifications: rawSpecs,
      bundleItems,
      ...rest
    } = dto;

    const previousType = product.type;

    // ۱. بررسی و به‌روزرسانی روابط پایه در صورت تغییر
    if (categoryId && categoryId !== product.category?.id) {
      const cat = await this.categoryRepo.findOne({
        where: { id: categoryId },
        select: { id: true, name: true, slug: true },
        loadEagerRelations: false,
      });
      if (!cat) throw new NotFoundException('دسته‌بندی نامعتبر است');
      product.category = cat;
    }

    if (brandId && brandId !== product.brand?.id) {
      const b = await this.brandRepo.findOne({
        where: { id: brandId },
        select: { id: true, name: true, slug: true },
        loadEagerRelations: false,
      });
      if (!b) throw new NotFoundException('برند نامعتبر است');
      product.brand = b;
    }

    if (subBrandId && subBrandId !== product.subBrand?.id) {
      const sb = await this.subBrandRepo.findOne({
        where: { id: subBrandId },
        select: { id: true, name: true, slug: true, brandId: true },
        loadEagerRelations: false,
      });
      if (!sb) throw new NotFoundException('زیربرند نامعتبر است');
      product.subBrand = sb;
    }

    const resolvedTags = Array.isArray(tagIds)
      ? await this.tagsService.findActiveByIdsOrFail(tagIds)
      : undefined;

    // پاکسازی مشخصات فنی
    let cleanSpecifications: { key: string; value: string }[] | undefined;
    if (rawSpecs !== undefined) {
      cleanSpecifications = Array.isArray(rawSpecs)
        ? rawSpecs
            .flat()
            .filter((item) => item && typeof item === 'object' && item.key)
            .map((item) => ({
              key: String(item.key).trim(),
              value: String(item.value ?? '').trim(),
            }))
        : [];
    }

    // ۲. بارگذاری تصاویر جدید مستقیم مالتر
    let newThumbnailUrl: string | undefined;
    let newGalleryUrls: string[] = [];
    const freshlyUploadedMediaIds: number[] = [];

    try {
      if (thumbnailFile) {
        const uploadedThumb = await this.mediaService.upload(thumbnailFile, {
          ownerType: MediaOwnerType.PRODUCT_THUMBNAIL,
          ownerId: String(product.id),
        });
        newThumbnailUrl = uploadedThumb.publicUrl;
        freshlyUploadedMediaIds.push(uploadedThumb.id);
      }

      if (imageFiles.length > 0) {
        const uploadedGallery = await this.mediaService.uploadMany(imageFiles, {
          ownerType: MediaOwnerType.PRODUCT_GALLERY,
          ownerId: String(product.id),
        });
        newGalleryUrls = uploadedGallery.map((m) => m.publicUrl);
        freshlyUploadedMediaIds.push(...uploadedGallery.map((m) => m.id));
      }
    } catch (uploadError: unknown) {
      for (const mediaId of freshlyUploadedMediaIds) {
        await this.mediaService.deleteById(mediaId).catch(() => {});
      }
      throw new InternalServerErrorException(
        'خطا در بارگذاری تصاویر جدید: ' + getErrorMessage(uploadError),
      );
    }

    // ۳. مدیریت تغییر و انتساب تامبنیل
    const oldThumbnail = product.thumbnail;
    const incomingThumb = rest.thumbnail;

    if (
      (removeOldThumbnail ||
        (incomingThumb && incomingThumb !== oldThumbnail) ||
        newThumbnailUrl) &&
      oldThumbnail
    ) {
      await this.mediaService.deleteByUrls([oldThumbnail]).catch(() => {});
    }

    if (incomingThumb) {
      await this.mediaService.reassignOwner(
        [incomingThumb],
        MediaOwnerType.PRODUCT_THUMBNAIL,
        String(product.id),
      );
    }

    try {
      const updatedProduct = await this.dataSource.transaction(
        async (manager) => {
          Object.assign(product, rest);
          if (cleanSpecifications !== undefined) {
            product.specifications = cleanSpecifications;
          }

          if (dto.title && dto.title !== product.title) {
            product.slug = this.generateSlug(dto.title);
          }

          if (newThumbnailUrl) {
            product.thumbnail = newThumbnailUrl;
          } else if (removeOldThumbnail && !thumbnailFile) {
            product.thumbnail = null;
          }

          // ۴. مدیریت تصاویر گالری
          const deleteIds = Array.isArray(imagesToDelete)
            ? imagesToDelete.map(Number).filter(Boolean)
            : [];

          if (deleteIds.length > 0) {
            const imagesForDelete = await manager.findBy(ProductImages, {
              id: In(deleteIds),
              product: { id: product.id },
            });

            const urlsToDelete = imagesForDelete.map((i) => i.url);
            if (urlsToDelete.length > 0) {
              await this.mediaService
                .deleteByUrls(urlsToDelete)
                .catch(() => {});
            }

            await manager.delete(ProductImages, {
              id: In(deleteIds),
              product: { id: product.id },
            });
          }

          if (Array.isArray(incomingGallery) || newGalleryUrls.length > 0) {
            const rawIncomingUrls: string[] = Array.isArray(incomingGallery)
              ? (incomingGallery as Array<string | { url?: string } | null>)
                  .map((img) => (typeof img === 'string' ? img : img?.url))
                  .filter((url): url is string => !!url)
              : [];

            const allTargetUrls = Array.from(
              new Set([...rawIncomingUrls, ...newGalleryUrls]),
            );

            const currentDbImages = await manager.findBy(ProductImages, {
              product: { id: product.id },
            });

            const toRemove = currentDbImages.filter(
              (img) => !allTargetUrls.includes(img.url),
            );
            if (toRemove.length > 0) {
              await this.mediaService
                .deleteByUrls(toRemove.map((i) => i.url))
                .catch(() => {});
              await manager.remove(ProductImages, toRemove);
            }

            const existingUrlsInDb = new Set(
              currentDbImages.map((img) => img.url),
            );
            const toAddUrls = allTargetUrls.filter(
              (url) => !existingUrlsInDb.has(url),
            );

            if (toAddUrls.length > 0) {
              await this.mediaService.reassignOwner(
                toAddUrls,
                MediaOwnerType.PRODUCT_GALLERY,
                String(product.id),
              );

              const newImageEntities = toAddUrls.map((url) =>
                manager.create(ProductImages, {
                  product,
                  url,
                }),
              );
              await manager.save(ProductImages, newImageEntities);
            }

            product.images = await manager.findBy(ProductImages, {
              product: { id: product.id },
            });
          }

          this.assertDiscountValid(product.price, product.priceDiscount);

          // ۵. تنوع‌ها و اقلام پک بر اساس نوع نهایی محصول
          if (product.type === 'variant') {
            const hasExisting = (product.variants ?? []).length > 0;
            if (Array.isArray(variants) || !hasExisting) {
              product.variants = await this.variantsService.sync(
                manager,
                product,
                product.variants ?? [],
                variants ?? [],
              );
            }
            Object.assign(
              product,
              this.variantsService.derivePricing(product.variants ?? []),
            );
          } else if ((product.variants ?? []).length > 0) {
            await this.variantsService.removeAll(manager, product.variants!);
            product.variants = [];
          }

          if (product.type === 'bundle') {
            if (Array.isArray(bundleItems) || previousType !== 'bundle') {
              await this.bundlesService.sync(manager, product, bundleItems);
            }
          } else if (previousType === 'bundle') {
            await this.bundlesService.clear(manager, product);
          }

          // ۷. به‌روزرسانی تگ‌ها
          if (resolvedTags !== undefined) {
            await manager
              .createQueryBuilder()
              .relation(Products, 'tags')
              .of(product)
              .addAndRemove(resolvedTags, product.tags ?? []);
            product.tags = resolvedTags;
          }

          return await manager.save(Products, product);
        },
      );

      return this.cleanCircularReferences(updatedProduct);
    } catch (dbError: unknown) {
      for (const mediaId of freshlyUploadedMediaIds) {
        await this.mediaService.deleteById(mediaId).catch(() => {});
      }

      if (dbError instanceof BadRequestException) throw dbError;
      throw new InternalServerErrorException(
        'خطا در به‌روزرسانی محصول در پایگاه داده: ' + getErrorMessage(dbError),
      );
    }
  }

  /**
   * واکشی تکی محصول به همراه تمام روابط مورد نیاز فرانت‌اند
   */
  async findOne(id: number): Promise<Products> {
    return this.findById(id);
  }

  /**
   * پاکسازی رفرنس‌های تکراری آبجکت والد
   */
  private cleanCircularReferences(product: Products): Products {
    if (Array.isArray(product.images)) {
      product.images = product.images.map((img) => {
        delete (img as Partial<ProductImages>).product;
        return img;
      });
    }

    if (Array.isArray(product.variants)) {
      product.variants = product.variants.map((v) => {
        delete (v as Partial<ProductVariants>).product;
        return v;
      });
    }

    if (Array.isArray(product.bundleItems)) {
      product.bundleItems = product.bundleItems.map((item) => {
        delete (item as Partial<typeof item>).bundle;
        return item;
      });
    }

    return product;
  }

  private assertDiscountValid(price?: number, discount?: number): void {
    if (discount && discount > 0 && price !== undefined && discount >= price) {
      throw new BadRequestException(
        'قیمت پس از تخفیف باید کمتر از قیمت اصلی باشد.',
      );
    }
  }

  private generateSlug(title: string): string {
    return title
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]+/g, '');
  }

  /**
   * حذف کامل محصول به همراه تمام فایل‌های متصل (تامبنیل و گالری) از طریق MediaService
   */
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.productRepo.findOne({
      where: { id },
      select: { id: true, variants: { id: true, images: true } },
      relations: {
        variants: true,
      },
      loadEagerRelations: false,
    });

    if (!product) throw new NotFoundException('محصول یافت نشد');

    // ۱. حذف رکورد محصول و روابط وابسته آن از پایگاه داده در یک تراکنش امن
    await this.dataSource.transaction(async (manager) => {
      await manager.remove(Products, product);
    });

    // ۲. پاکسازی کامل فایل‌های مرتبط (تامبنیل و تمام تصاویر گالری) از روی FTP و جدول Media
    try {
      await this.mediaService.deleteByOwner(
        MediaOwnerType.PRODUCT_THUMBNAIL,
        String(id),
      );
      await this.mediaService.deleteByOwner(
        MediaOwnerType.PRODUCT_GALLERY,
        String(id),
      );
    } catch (err: unknown) {
      // خطا در حذف فایل‌های هاست نباید باعث شکست کل عملیات حذف محصول در دیتابیس شود، پس فقط لاگ می‌کنیم
      this.logger.error(
        `خطا در حذف فایل‌های مرتبط با محصول ${id}: ${getErrorMessage(err)}`,
      );
    }

    return { message: 'محصول و تمام فایل‌های مربوطه با موفقیت حذف شدند' };
  }

  // =========================================================================
  // ─── PRIVATE HELPERS (متدهای کمکی خصوصی) ─────────────────────────────────
  // =========================================================================

  private sanitizeLimit(limit?: number, fallback = DEFAULT_LIMIT): number {
    if (!limit || limit < 1) return fallback;
    return Math.min(limit, MAX_LIMIT);
  }

  private applySorting(qb: SelectQueryBuilder<Products>, sort: string) {
    switch (sort) {
      case 'cheapest':
        qb.orderBy('p.price', 'ASC');
        break;
      case 'expensive':
        qb.orderBy('p.price', 'DESC');
        break;
      case 'popular':
        qb.orderBy('p.averageRating', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('p.createdAt', 'DESC');
        break;
    }
  }

  /**
   * بارگذاری batch عکس‌های گالری برای مجموعه‌ای از محصولات، بدون join مستقیم
   * به کوئری اصلی (که در ترکیب با skip/take باعث نتایج نادرست می‌شود).
   */
  private async attachImages(products: Products[]): Promise<Products[]> {
    if (!products.length) return products;

    const ids = products.map((p) => p.id);

    const { entities: images, raw } = await this.imageRepo
      .createQueryBuilder('img')
      .select(['img.id', 'img.url'])
      .leftJoin('img.product', 'p')
      .addSelect('p.id', 'productId')
      .where('p.id IN (:...ids)', { ids })
      .orderBy('img.id', 'ASC')
      .getRawAndEntities<{ productId: string }>();

    const grouped = new Map<number, ProductImages[]>();
    images.forEach((img, i) => {
      const pid = Number(raw[i]?.productId);
      if (!grouped.has(pid)) grouped.set(pid, []);
      grouped.get(pid)!.push(img);
    });

    for (const product of products) {
      product.images = grouped.get(product.id) ?? [];
    }

    return products;
  }

  /**
   * به‌جای ORDER BY RANDOM() (که روی جدول بزرگ کند است و باعث full scan می‌شود)،
   * یک offset تصادفی محاسبه می‌کنیم و یک برش پیوسته از نتایج مرتب‌شده می‌گیریم.
   * این روش هزینه‌ی خیلی کمتری دارد و برای ویجت‌های "محصولات مشابه/مرتبط" کافی است.
   */
  private async randomSample(
    qb: ReturnType<Repository<Products>['createQueryBuilder']>,
    limit: number,
  ): Promise<Products[]> {
    const total = await qb.clone().getCount();
    if (total === 0) return [];

    const maxOffset = Math.max(total - limit, 0);
    const randomOffset = Math.floor(Math.random() * (maxOffset + 1));

    return qb
      .clone()
      .orderBy('p.id', 'ASC')
      .skip(randomOffset)
      .take(limit)
      .getMany();
  }

  private calculateDiscounts(products: Products[]): ProductWithBadges[] {
    return products.map((p) => this.calculateSingleDiscount(p));
  }

  private calculateSingleDiscount(product: Products): ProductWithBadges {
    const discountPercent = getDiscountPercent(product);

    return {
      ...product,
      discountPercent,
      stockStatus: getStockStatus(product),
      badges: buildProductBadges(product),
    } as ProductWithBadges;
  }

  async exportAll() {
    const products = await this.productRepo.find({
      select: {
        id: true,
        title: true,
        sku: true,
        type: true,
        price: true,
        priceDiscount: true,
        stock: true,
        isAvailable: true,
        category: { name: true },
        brand: { name: true },
      },
      relations: {
        category: true,
        brand: true,
        priceTiers: true,
        variants: { attributeValues: { attribute: true }, priceTiers: true },
      },
      loadEagerRelations: false,
      order: { id: 'ASC' },
    });
    return products;
  }
}
