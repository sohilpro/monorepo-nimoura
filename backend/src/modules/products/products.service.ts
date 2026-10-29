// src/modules/products/products.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
import { Tags } from 'src/modules/tags/entities/tags.entity';
// import { getSafeExtension } from 'src/common/utils/extention';
import { buildPagination } from 'src/common/utils/pagination.helper';
// import { MediaService } from '../media/media.service';
import { MediaOwnerType } from '../media/enums/media-owner-type.enum';
import { AttributeValues } from './entities/attribute-values.entity';
import { BundleItems } from './entities/bundle-items.entity';
import { MediaStaticService } from '../media/media-static.service';
import { Attributes } from './entities/attributes.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductPriceTiers } from './entities/product-price-tiers.entity';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 12;

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
    @InjectRepository(Tags)
    private readonly tagRepo: Repository<Tags>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly mediaService: MediaStaticService,
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
    } catch (error: any) {
      this.logger.error(`Error in syncAmazingOffersDaily: ${error.message}`);
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
      .leftJoinAndSelect('pv.product', 'prod') // الزامی برای دریافت شناسه محصول
      .leftJoinAndSelect('pv.attributeValues', 'av')
      .leftJoinAndSelect('av.attribute', 'attr')
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
      delete (variant as any).product; // جلوگیری از Circular JSON و تکرار داده‌ها
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
      .leftJoin('t.product', 'tp')
      .addSelect('tp.id')
      .leftJoin('t.variant', 'tv')
      .addSelect('tv.id')
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
    const { search, brandId, categoryId, sort = 'newest' } = query;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.brand', 'b')
      .where('p.isAvailable = :isAvailable', { isAvailable: true });

    if (search) {
      qb.andWhere(
        '(p.title ILIKE :search OR p.englishTitle ILIKE :search OR p.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (brandId) {
      qb.andWhere('p.brandId = :brandId', { brandId });
    }

    if (categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId });
    }

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
        .getRawMany(),
      base()
        .innerJoin('p.brand', 'b')
        .select('b.id', 'id')
        .addSelect('b.name', 'name')
        .addSelect('COUNT(p.id)', 'count')
        .groupBy('b.id')
        .addGroupBy('b.name')
        .orderBy('count', 'DESC')
        .getRawMany(),
    ]);

    const toNum = (r: any) => ({
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
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.brand', 'b')
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
    const { minPrice, maxPrice } = query as any;

    // تاریخ امروز به عنوان Seed روزانه
    const todaySeed = new Date().toISOString().split('T')[0];

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('p.images', 'img')
      // ۱. اضافه کردن فرمول شافل به عنوان فیلد محاسباتی
      .addSelect(`md5(concat(p.id, '${todaySeed}'))`, 'daily_shuffle')
      .where('p.isAmazingOffer = :amazing', { amazing: true })
      .andWhere('p.isAvailable = :available', { available: true })
      .andWhere(
        '( (p.type = :simple AND p.stock > 0) OR (p.type = :variant AND v.stock > 0) OR (p.type = :bundle) )',
        {
          simple: 'simple',
          variant: 'variant',
          bundle: 'bundle',
        },
      );

    // ۲. فیلتر حداقل قیمت (هم برای محصول ساده هم واریانت‌ها)
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      qb.andWhere(
        '( (p.type = :simple AND p.price >= :minPrice) OR (p.type = :variant AND v.price >= :minPrice) )',
        { minPrice: Number(minPrice) },
      );
    }

    // ۳. فیلتر حداکثر قیمت (هم برای محصول ساده هم واریانت‌ها)
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      qb.andWhere(
        '( (p.type = :simple AND p.price <= :maxPrice) OR (p.type = :variant AND v.price <= :maxPrice) )',
        { maxPrice: Number(maxPrice) },
      );
    }

    // ۴. مرتب‌سازی بر اساس نام مستعار تعریف‌شده
    qb.orderBy('daily_shuffle', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

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
    });

    if (!brand) {
      throw new NotFoundException('برند مورد نظر یافت نشد');
    }

    // ۲. در صورت وجود subBrandId، دریافت اطلاعات زیربرند مربوطه
    let activeSubBrand: SubBrands | null = null;
    if (subBrandId) {
      activeSubBrand = await subBrandRepo.findOne({
        where: { id: Number(subBrandId), brandId: brand.id },
      });
    }

    // ۳. ساخت QueryBuilder برای محصولات
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('p.subBrand', 'sb')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.variants', 'v');

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
        '( (p.type = :simple AND p.price >= :minPrice) OR (p.type = :variant AND v.price >= :minPrice) )',
        { minPrice: Number(minPrice), simple: 'simple', variant: 'variant' },
      );
    }

    // فیلتر حداکثر قیمت
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      qb.andWhere(
        '( (p.type = :simple AND p.price <= :maxPrice) OR (p.type = :variant AND v.price <= :maxPrice) )',
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

    await this.attachImages(items);

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
    const { search, sort = 'newest', isAvailable, minPrice, maxPrice } = query;

    // ۱. پیدا کردن خودِ دسته‌بندی اصلی همراه با والدش جهت ساخت بریدکرامب
    const categoryRepo = this.productRepo.manager.getRepository(Categories);
    const currentCategory = await categoryRepo.findOne({
      where: { id: categoryId },
      relations: {
        parent: {
          parent: true, // لایه دوم والد
        },
      },
    });

    if (!currentCategory) {
      throw new NotFoundException('دسته‌بندی مورد نظر یافت نشد');
    }

    // ۲. پیدا کردن شناسه این دسته‌بندی و تمام زیردسته‌های آن با CTE بازگشتی در پستگرس
    const categoryTreeIds: { id: number }[] = await this.dataSource.query(
      `
    WITH RECURSIVE cat_tree AS (
      SELECT id FROM categories WHERE id = $1
      UNION ALL
      SELECT c.id FROM categories c
      INNER JOIN cat_tree ct ON c."parentId" = ct.id
    )
    SELECT id FROM cat_tree
  `,
      [categoryId],
    );

    const ids = categoryTreeIds.map((c) => c.id);
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
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.brand', 'b')
      .where('p.categoryId IN (:...ids)', { ids });

    // اعمال فیلتر موجودی
    if (typeof isAvailable === 'boolean') {
      qb.andWhere('p.isAvailable = :isAvailable', { isAvailable });
    }

    if (minPrice !== undefined && minPrice !== null) {
      qb.andWhere('p.price >= :minPrice', { minPrice: Number(minPrice) });
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      qb.andWhere('p.price <= :maxPrice', { maxPrice: Number(maxPrice) });
    }

    // فیلتر برند (در صورت ارسال در query)
    if (query.brandId) {
      qb.andWhere('p.brandId = :brandId', { brandId: query.brandId });
    }

    if (search) {
      qb.andWhere('(p.title ILIKE :search OR p.englishTitle ILIKE :search)', {
        search: `%${search}%`,
      });
    }

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
      relations: {
        category: {
          parent: {
            parent: true,
          },
        },
        brand: true,
        subBrand: true,
        tags: true,
        images: true,
        priceTiers: true, // پله‌های قیمتی محصول ساده
        variants: {
          attributeValues: {
            attribute: true,
          },
          priceTiers: true, // پله‌های قیمتی واریانت‌ها
        },
        bundleItems: {
          product: true,
          variant: true,
        },
      },
      order: {
        priceTiers: {
          minQuantity: 'ASC', // سورت صعودی پله‌های محصول
        },
        variants: {
          priceTiers: {
            minQuantity: 'ASC', // سورت صعودی پله‌های هر واریانت
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('محصول یافت نشد');
    }

    // ۱. حذف چرخه product از داخل عکس‌های گالری
    if (Array.isArray(product.images)) {
      product.images = product.images.map((img) => {
        const { product: _, ...cleanImg } = img;
        return cleanImg as any;
      });
    }

    // ۲. حذف چرخه‌های product و variant از پله‌های خود محصول
    if (Array.isArray(product.priceTiers)) {
      product.priceTiers = product.priceTiers.map((tier) => {
        const { product: _, variant: __, ...cleanTier } = tier;
        return cleanTier as any;
      });
    }

    // ۳. حذف چرخه product و تمیزکاری پله‌ها از داخل واریانت‌ها
    if (Array.isArray(product.variants)) {
      product.variants = product.variants.map((variant) => {
        const { product: _, ...cleanVariant } = variant;

        if (Array.isArray(cleanVariant.priceTiers)) {
          cleanVariant.priceTiers = cleanVariant.priceTiers.map((tier) => {
            const { product: __, variant: ___, ...cleanTier } = tier;
            return cleanTier as any;
          });
        }

        return cleanVariant as any;
      });
    }

    return product;
  }

  /**
   * واکشی تکی با اسلاگ (SEO-Friendly)
   */
  async findBySlug(slug: string): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: {
        category: true,
        brand: true,
        variants: {
          attributeValues: true,
          priceTiers: true, // لود پله‌های هر واریانت
        },
        priceTiers: true, // لود پله‌های محصول ساده
      },
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
    page = 1,
    limit = 8,
  ): Promise<Products[]> {
    const current = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!current?.category?.id) {
      return [];
    }

    const products = await this.randomSample(
      this.productRepo
        .createQueryBuilder('p')
        .innerJoin('p.category', 'category')
        .where('category.id = :categoryId', {
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
    page = 1,
    limit = 8,
  ): Promise<Products[]> {
    const current = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!current?.brand?.id) {
      return [];
    }

    const brandId = current.brand.id;

    const products = await this.randomSample(
      this.productRepo
        .createQueryBuilder('p')
        .innerJoin('p.brand', 'brand')
        .where('brand.id = :brandId', { brandId })
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
      tags,
      bundleItems,
      priceTiers: rawProductPriceTiers, // پله‌های محصول ساده
      images: rawGalleryUrls,
      specifications: rawSpecs,
      ...rest
    } = dto as any;

    // ۱. بررسی صحت روابط پایه (دسته‌بندی، برند و زیربرند)
    const [category, brand, subBrand] = await Promise.all([
      categoryId ? this.categoryRepo.findOneBy({ id: categoryId }) : null,
      brandId ? this.brandRepo.findOneBy({ id: brandId }) : null,
      subBrandId ? this.subBrandRepo.findOneBy({ id: subBrandId }) : null,
    ]);

    if (categoryId && !category)
      throw new NotFoundException('دسته‌بندی یافت نشد');
    if (brandId && !brand) throw new NotFoundException('برند یافت نشد');
    if (subBrandId && !subBrand)
      throw new NotFoundException('زیربرند یافت نشد');

    const resolvedTags = Array.isArray(tags)
      ? await this.resolveTags(tags)
      : [];

    // بررسی سازگاری نوع محصول پک
    if (
      rest.type === 'bundle' &&
      (!Array.isArray(bundleItems) || bundleItems.length === 0)
    ) {
      throw new BadRequestException(
        'برای ساخت محصول از نوع پک، حداقل یک آیتم باید به عنوان اقلام پک مشخص شود.',
      );
    }

    // پاکسازی امن مشخصات فنی
    const cleanSpecifications = Array.isArray(rawSpecs)
      ? rawSpecs
          .flat()
          .filter((item: any) => item && typeof item === 'object' && item.key)
          .map((item: any) => ({
            key: String(item.key).trim(),
            value: String(item.value ?? '').trim(),
          }))
      : [];

    let savedProduct: Products;
    let thumbnailUrl: string | undefined;
    let uploadedGalleryUrls: string[] = [];
    const uploadedMediaIds: number[] = [];

    const initialGalleryUrls = Array.isArray(rawGalleryUrls)
      ? rawGalleryUrls.filter(
          (u: any) => typeof u === 'string' && u.trim() !== '',
        )
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

        // ب) پردازش و ذخیره پله‌های قیمتی محصول ساده (در صورتی که نوع ساده باشد)
        if (
          newProduct.type === 'simple' &&
          Array.isArray(rawProductPriceTiers) &&
          rawProductPriceTiers.length > 0
        ) {
          // حذف تعدادهای تکراری و مرتب‌سازی
          const cleanTiersMap = new Map<number, number>();
          for (const t of rawProductPriceTiers) {
            const qty = Number(t.minQuantity);
            const price = Number(t.price);
            if (qty > 1 && price > 0) {
              cleanTiersMap.set(qty, price);
            }
          }

          const tierEntities = Array.from(cleanTiersMap.entries()).map(
            ([minQuantity, price]) =>
              manager.create(ProductPriceTiers, {
                product: newProduct,
                variant: null,
                minQuantity,
                price,
              }),
          );

          if (tierEntities.length > 0) {
            newProduct.priceTiers = await manager.save(
              ProductPriceTiers,
              tierEntities,
            );
          }
        }

        // ج) پردازش و ذخیره واریانت‌ها به همراه پله‌های قیمتی هر واریانت
        if (
          newProduct.type === 'variant' &&
          Array.isArray(variants) &&
          variants.length > 0
        ) {
          const resolvedAttrValueMap = new Map<string, AttributeValues>();

          for (const v of variants) {
            const rawAttrs = v.attributeValues || [];
            for (const attrItem of rawAttrs) {
              const attrName = (attrItem.attributeName || 'ویژگی').trim();
              const attrVal = String(attrItem.value || '').trim();
              const key = `${attrName}:::${attrVal}`;

              if (!resolvedAttrValueMap.has(key) && attrVal !== '') {
                let attributeEntity = await manager.findOne(Attributes, {
                  where: { name: attrName },
                });

                if (!attributeEntity) {
                  attributeEntity = await manager.save(
                    Attributes,
                    manager.create(Attributes, { name: attrName }),
                  );
                }

                let attrValEntity = await manager.findOne(AttributeValues, {
                  where: {
                    value: attrVal,
                    attribute: { id: attributeEntity.id },
                  },
                  relations: { attribute: true },
                });

                if (!attrValEntity) {
                  attrValEntity = await manager.save(
                    AttributeValues,
                    manager.create(AttributeValues, {
                      value: attrVal,
                      attribute: attributeEntity,
                    }),
                  );
                }

                resolvedAttrValueMap.set(key, attrValEntity);
              }
            }
          }

          const savedVariantEntities: ProductVariants[] = [];

          for (let idx = 0; idx < variants.length; idx++) {
            const v = variants[idx];
            const matchedAttrValues: AttributeValues[] = [];

            if (Array.isArray(v.attributeValues)) {
              for (const item of v.attributeValues) {
                const key = `${(item.attributeName || 'ویژگی').trim()}:::${String(item.value || '').trim()}`;
                const found = resolvedAttrValueMap.get(key);
                if (found) matchedAttrValues.push(found);
              }
            }

            const variantImages = Array.isArray(v.images)
              ? v.images
              : v.image
                ? [v.image]
                : [];

            const safeSku = v.sku?.trim()
              ? v.sku.trim()
              : `VAR-${newProduct.id}-${idx + 1}-${Date.now().toString(36).slice(-3)}`;

            // ۱. ذخیره خود واریانت
            const variantEntity = manager.create(ProductVariants, {
              sku: safeSku,
              price: Number(v.price) || 0,
              priceDiscount: Number(v.priceDiscount) || 0,
              percentageDiscount: Number(v.percentageDiscount) || 0,
              stock: Number(v.stock) || 0,
              isAvailable: v.isAvailable ?? true,
              images: variantImages,
              product: newProduct,
              attributeValues: matchedAttrValues,
            });

            const savedVariant = await manager.save(
              ProductVariants,
              variantEntity,
            );

            // ۲. ذخیره پله‌های قیمتی اختصاصی این واریانت
            if (Array.isArray(v.priceTiers) && v.priceTiers.length > 0) {
              const vTierMap = new Map<number, number>();
              for (const t of v.priceTiers) {
                const qty = Number(t.minQuantity);
                const price = Number(t.price);
                if (qty > 1 && price > 0) {
                  vTierMap.set(qty, price);
                }
              }

              const vTierEntities = Array.from(vTierMap.entries()).map(
                ([minQuantity, price]) =>
                  manager.create(ProductPriceTiers, {
                    product: null,
                    variant: savedVariant,
                    minQuantity,
                    price,
                  }),
              );

              if (vTierEntities.length > 0) {
                savedVariant.priceTiers = await manager.save(
                  ProductPriceTiers,
                  vTierEntities,
                );
              }
            }

            savedVariantEntities.push(savedVariant);
          }

          newProduct.variants = savedVariantEntities;

          // انتساب مدیاها
          for (const savedVariant of newProduct.variants) {
            if (savedVariant.images?.length) {
              await this.mediaService
                .reassignOwner(
                  savedVariant.images,
                  MediaOwnerType.PRODUCT_VARIANT,
                  String(savedVariant.id),
                )
                .catch(() => {});
            }
          }
        }

        // د) پردازش و ذخیره اقلام پک (Bundle)
        if (
          newProduct.type === 'bundle' &&
          Array.isArray(bundleItems) &&
          bundleItems.length > 0
        ) {
          const productIds = Array.from(
            new Set(bundleItems.map((item: any) => item.productId)),
          );
          const variantIds = Array.from(
            new Set(
              bundleItems
                .map((item: any) => item.variantId)
                .filter((id: any): id is number => typeof id === 'number'),
            ),
          );

          const [foundProducts, foundVariants] = await Promise.all([
            manager.findBy(Products, { id: In(productIds) }),
            variantIds.length > 0
              ? manager.findBy(ProductVariants, { id: In(variantIds) })
              : Promise.resolve([]),
          ]);

          if (foundProducts.length !== productIds.length) {
            throw new BadRequestException(
              'یک یا چند محصول انتخاب‌شده برای اقلام پک یافت نشدند.',
            );
          }

          if (foundVariants.length !== variantIds.length) {
            throw new BadRequestException(
              'یک یا چند واریانت انتخاب‌شده برای اقلام پک یافت نشدند.',
            );
          }

          const bundleItemEntities = bundleItems.map((item: any) => {
            const targetProduct = foundProducts.find(
              (p) => p.id === item.productId,
            );
            const targetVariant = item.variantId
              ? foundVariants.find((v) => v.id === item.variantId)
              : undefined;

            return manager.create(BundleItems, {
              bundle: newProduct,
              product: targetProduct,
              variant: targetVariant,
              quantity: item.quantity || 1,
            });
          });

          newProduct.bundleItems = await manager.save(
            BundleItems,
            bundleItemEntities,
          );
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
    } catch (dbError: any) {
      if (dbError instanceof BadRequestException) throw dbError;
      throw new InternalServerErrorException(
        'خطا در ایجاد رکورد محصول در پایگاه داده: ' + dbError.message,
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
    } catch (uploadOrUpdateError: any) {
      await this.productRepo.remove(savedProduct).catch(() => {});
      for (const mediaId of uploadedMediaIds) {
        await this.mediaService.deleteById(mediaId).catch(() => {});
      }

      throw new InternalServerErrorException(
        'خطا در پردازش و ذخیره تصاویر محصول: ' + uploadOrUpdateError.message,
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
        priceTiers: true,
        variants: {
          priceTiers: true,
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
      tags,
      removeOldThumbnail,
      specifications: rawSpecs,
      priceTiers: incomingProductPriceTiers,
      ...rest
    } = dto as any;

    // ۱. بررسی و به‌روزرسانی روابط پایه در صورت تغییر
    if (categoryId && categoryId !== product.category?.id) {
      const cat = await this.categoryRepo.findOneBy({ id: categoryId });
      if (!cat) throw new NotFoundException('دسته‌بندی نامعتبر است');
      product.category = cat;
    }

    if (brandId && brandId !== product.brand?.id) {
      const b = await this.brandRepo.findOneBy({ id: brandId });
      if (!b) throw new NotFoundException('برند نامعتبر است');
      product.brand = b;
    }

    if (subBrandId && subBrandId !== product.subBrand?.id) {
      const sb = await this.subBrandRepo.findOneBy({ id: subBrandId });
      if (!sb) throw new NotFoundException('زیربرند نامعتبر است');
      product.subBrand = sb;
    }

    const resolvedTags = Array.isArray(tags)
      ? await this.resolveTags(tags)
      : undefined;

    // پاکسازی مشخصات فنی
    if (rawSpecs !== undefined) {
      rest.specifications = Array.isArray(rawSpecs)
        ? rawSpecs
            .flat()
            .filter((item: any) => item && typeof item === 'object' && item.key)
            .map((item: any) => ({
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
    } catch (uploadError: any) {
      for (const mediaId of freshlyUploadedMediaIds) {
        await this.mediaService.deleteById(mediaId).catch(() => {});
      }
      throw new InternalServerErrorException(
        'خطا در بارگذاری تصاویر جدید: ' + uploadError.message,
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

          if (dto.title && dto.title !== product.title) {
            product.slug = this.generateSlug(dto.title);
          }

          if (newThumbnailUrl) {
            product.thumbnail = newThumbnailUrl;
          } else if (removeOldThumbnail && !thumbnailFile) {
            product.thumbnail = null as any;
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
              ? incomingGallery
                  .map((img: any) => (typeof img === 'string' ? img : img?.url))
                  .filter(Boolean)
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

          // ۵. به‌روزرسانی پله‌های قیمتی محصول ساده
          if (incomingProductPriceTiers !== undefined) {
            await manager.delete(ProductPriceTiers, {
              product: { id: product.id },
            });

            if (
              Array.isArray(incomingProductPriceTiers) &&
              incomingProductPriceTiers.length > 0
            ) {
              const cleanTiersMap = new Map<number, number>();
              for (const t of incomingProductPriceTiers) {
                const qty = Number(t.minQuantity);
                const price = Number(t.price);
                if (qty > 1 && price > 0) {
                  cleanTiersMap.set(qty, price);
                }
              }

              const tierEntities = Array.from(cleanTiersMap.entries()).map(
                ([minQuantity, price]) =>
                  manager.create(ProductPriceTiers, {
                    product,
                    variant: null,
                    minQuantity,
                    price,
                  }),
              );

              if (tierEntities.length > 0) {
                product.priceTiers = await manager.save(
                  ProductPriceTiers,
                  tierEntities,
                );
              } else {
                product.priceTiers = [];
              }
            } else {
              product.priceTiers = [];
            }
          }

          // ۶. به‌روزرسانی هوشمند واریانت‌ها (حل خطای کلید خارجی order_items با Upsert)
          if (Array.isArray(variants)) {
            const currentVariants = product.variants || [];
            const oldVariantImageUrls = currentVariants.flatMap(
              (v) => v.images || [],
            );

            const incomingVariantIds = variants
              .map((v: any) => v.id)
              .filter(
                (id: any): id is number => typeof id === 'number' && !isNaN(id),
              );

            // شناسایی واریانت‌های حذف‌شده از فرم
            const variantsToDelete = currentVariants.filter(
              (cv) => !incomingVariantIds.includes(cv.id),
            );

            for (const vToDelete of variantsToDelete) {
              try {
                await manager.delete(ProductPriceTiers, {
                  variant: { id: vToDelete.id },
                });
                await manager.remove(ProductVariants, vToDelete);
              } catch (err: any) {
                // اگر در order_items بود، غیرفعال می‌شود تا یکپارچگی ارجاعی حفظ گردد
                vToDelete.isAvailable = false;
                vToDelete.stock = 0;
                await manager.save(ProductVariants, vToDelete);
              }
            }

            if (variants.length > 0) {
              const resolvedAttrValueMap = new Map<string, AttributeValues>();

              for (const v of variants) {
                const rawAttrs = v.attributeValues || [];
                for (const attrItem of rawAttrs) {
                  const attrName = (attrItem.attributeName || 'ویژگی').trim();
                  const attrVal = String(attrItem.value || '').trim();
                  const key = `${attrName}:::${attrVal}`;

                  if (!resolvedAttrValueMap.has(key) && attrVal !== '') {
                    let attributeEntity = await manager.findOne(Attributes, {
                      where: { name: attrName },
                    });

                    if (!attributeEntity) {
                      attributeEntity = await manager.save(
                        Attributes,
                        manager.create(Attributes, { name: attrName }),
                      );
                    }

                    let attrValEntity = await manager.findOne(AttributeValues, {
                      where: {
                        value: attrVal,
                        attribute: { id: attributeEntity.id },
                      },
                      relations: { attribute: true },
                    });

                    if (!attrValEntity) {
                      attrValEntity = await manager.save(
                        AttributeValues,
                        manager.create(AttributeValues, {
                          value: attrVal,
                          attribute: attributeEntity,
                        }),
                      );
                    }

                    resolvedAttrValueMap.set(key, attrValEntity);
                  }
                }
              }

              const finalVariants: ProductVariants[] = [];

              for (let idx = 0; idx < variants.length; idx++) {
                const v = variants[idx];
                const matchedAttrValues: AttributeValues[] = [];

                if (Array.isArray(v.attributeValues)) {
                  for (const item of v.attributeValues) {
                    const key = `${(item.attributeName || 'ویژگی').trim()}:::${String(item.value || '').trim()}`;
                    const found = resolvedAttrValueMap.get(key);
                    if (found) matchedAttrValues.push(found);
                  }
                }

                const variantImages = Array.isArray(v.images)
                  ? v.images
                  : v.image
                    ? [v.image]
                    : [];

                let variantEntity: ProductVariants | null = null;
                if (v.id) {
                  variantEntity =
                    currentVariants.find((cv) => cv.id === Number(v.id)) ||
                    null;
                }

                const safeSku = v.sku?.trim()
                  ? v.sku.trim()
                  : `VAR-${product.id}-${idx + 1}-${Date.now().toString(36).slice(-3)}`;

                if (variantEntity) {
                  variantEntity.sku = safeSku;
                  variantEntity.price = Number(v.price) || 0;
                  variantEntity.priceDiscount = Number(v.priceDiscount) || 0;
                  variantEntity.percentageDiscount =
                    Number(v.percentageDiscount) || 0;
                  variantEntity.stock = Number(v.stock) || 0;
                  variantEntity.isAvailable = v.isAvailable ?? true;
                  variantEntity.images = variantImages;
                  variantEntity.attributeValues = matchedAttrValues;
                } else {
                  variantEntity = manager.create(ProductVariants, {
                    sku: safeSku,
                    price: Number(v.price) || 0,
                    priceDiscount: Number(v.priceDiscount) || 0,
                    percentageDiscount: Number(v.percentageDiscount) || 0,
                    stock: Number(v.stock) || 0,
                    isAvailable: v.isAvailable ?? true,
                    images: variantImages,
                    product,
                    attributeValues: matchedAttrValues,
                  });
                }

                const savedVariant = await manager.save(
                  ProductVariants,
                  variantEntity,
                );

                // به‌روزرسانی پله‌های قیمتی این واریانت
                await manager.delete(ProductPriceTiers, {
                  variant: { id: savedVariant.id },
                });

                if (Array.isArray(v.priceTiers) && v.priceTiers.length > 0) {
                  const vTierMap = new Map<number, number>();
                  for (const t of v.priceTiers) {
                    const qty = Number(t.minQuantity);
                    const price = Number(t.price);
                    if (qty > 1 && price > 0) {
                      vTierMap.set(qty, price);
                    }
                  }

                  const vTierEntities = Array.from(vTierMap.entries()).map(
                    ([minQuantity, price]) =>
                      manager.create(ProductPriceTiers, {
                        product: null,
                        variant: savedVariant,
                        minQuantity,
                        price,
                      }),
                  );

                  if (vTierEntities.length > 0) {
                    savedVariant.priceTiers = await manager.save(
                      ProductPriceTiers,
                      vTierEntities,
                    );
                  } else {
                    savedVariant.priceTiers = [];
                  }
                } else {
                  savedVariant.priceTiers = [];
                }

                finalVariants.push(savedVariant);
              }

              product.variants = finalVariants;

              for (const savedVariant of product.variants) {
                if (savedVariant.images?.length) {
                  await this.mediaService
                    .reassignOwner(
                      savedVariant.images,
                      MediaOwnerType.PRODUCT_VARIANT,
                      String(savedVariant.id),
                    )
                    .catch(() => {});
                }
              }

              const newVariantImageUrls = product.variants.flatMap(
                (v) => v.images || [],
              );
              const urlsToRemove = oldVariantImageUrls.filter(
                (url) => !newVariantImageUrls.includes(url),
              );
              if (urlsToRemove.length > 0) {
                await this.mediaService
                  .deleteByUrls(urlsToRemove)
                  .catch(() => {});
              }
            } else {
              product.variants = [];
            }
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
    } catch (dbError: any) {
      for (const mediaId of freshlyUploadedMediaIds) {
        await this.mediaService.deleteById(mediaId).catch(() => {});
      }

      if (dbError instanceof BadRequestException) throw dbError;
      throw new InternalServerErrorException(
        'خطا در به‌روزرسانی محصول در پایگاه داده: ' + dbError.message,
      );
    }
  }

  /**
   * واکشی تکی محصول به همراه تمام روابط مورد نیاز فرانت‌اند
   */
  async findOne(id: number): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
        subBrand: true,
        images: true,
        tags: true,
        variants: {
          attributeValues: {
            attribute: true, // لود کامل نام مشخصه برای فرانت‌اند
          },
        },
      },
    });

    if (!product) throw new NotFoundException('محصول یافت نشد');
    return this.cleanCircularReferences(product);
  }

  /**
   * پاکسازی رفرنس‌های تکراری آبجکت والد
   */
  private cleanCircularReferences(product: Products): Products {
    if (Array.isArray(product.images)) {
      product.images = product.images.map((img: any) => {
        delete img.product;
        return img;
      });
    }

    if (Array.isArray(product.variants)) {
      product.variants = product.variants.map((v: any) => {
        delete v.product;
        return v;
      });
    }

    return product;
  }

  private generateSlug(title: string): string {
    return title
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\u0600-\u06FF\w\-]+/g, '');
  }

  private async resolveTags(tags: any[]): Promise<any[]> {
    // پیاده‌سازی متد رزولوشن تگ‌های موجود در سرویس شما
    return tags;
  }

  /**
   * حذف کامل محصول به همراه تمام فایل‌های متصل (تامبنیل و گالری) از طریق MediaService
   */
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        variants: true, // نیازی به لود کردن images نیست چون MediaService خودش بر اساس ownerId و ownerType مدیریتشان می‌کند
      },
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
    } catch (err: any) {
      // خطا در حذف فایل‌های هاست نباید باعث شکست کل عملیات حذف محصول در دیتابیس شود، پس فقط لاگ می‌کنیم
      this.logger.error(
        `خطا در حذف فایل‌های مرتبط با محصول ${id}: ${err.message}`,
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

  private applySorting(qb: any, sort: string) {
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
      .leftJoin('img.product', 'p')
      .addSelect('p.id', 'productId')
      .where('p.id IN (:...ids)', { ids })
      .orderBy('img.id', 'ASC')
      .getRawAndEntities();

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

  private calculateDiscounts(products: Products[]): any[] {
    return products.map((p) => this.calculateSingleDiscount(p));
  }

  private calculateSingleDiscount(product: Products): any {
    const price = Number(product.price) || 0;
    const discountPrice = Number(product.priceDiscount) || 0;

    let discountPercent = 0;
    if (price > 0 && discountPrice > 0 && discountPrice < price) {
      discountPercent = Math.round(((price - discountPrice) / price) * 100);
    }

    return {
      ...product,
      discountPercent,
    };
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
