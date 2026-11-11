/**
 * Seeds the Bioksin FORTE anti-hair-loss shampoo (300 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-bioksin-forte.ts
 */
import { DataSource, EntityManager } from 'typeorm';
import dataSource from '../src/common/database/data-source';
import { Attributes } from '../src/modules/products/entities/attributes.entity';
import { AttributeValues } from '../src/modules/products/entities/attribute-values.entity';
import { Brands } from '../src/modules/brands/entities/brands.entity';
import { Categories } from '../src/modules/categories/entities/categories.entity';
import { ProductVariants } from '../src/modules/products/entities/product-variants.entity';
import { Products } from '../src/modules/products/entities/products.entity';
import { TagGroups } from '../src/modules/tags/entities/tag-groups.entity';
import { Tags } from '../src/modules/tags/entities/tags.entity';

/* ------------------------------------------------------------------ */
/* Product copy                                                       */
/* ------------------------------------------------------------------ */

const PRODUCT = {
  title: 'شامپو ضد ریزش مو بیوکسین مدل FORTE حجم ۳۰۰ میلی‌لیتر',
  englishTitle: 'Bioksin Forte Anti-Hair Loss Shampoo 300 ml',
  sku: 'BIO-FORTE-300',
  slug: 'bioksin-forte-anti-hair-loss-shampoo-300ml',
  /** Only size in this line-up, so the product is a plain (simple) SKU. */
  volumeLabel: '۳۰۰ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  price: 780_000,
  priceDiscount: 0,
  stock: 40,
  lowStockThreshold: 8,
  shortDescription:
    'شامپو ضد ریزش مو بیوکسین مدل FORTE با فرمول گیاهی و بدون پارابن، ریزش موی فصلی و ارثی را کاهش می‌دهد، تارهای نازک را تقویت می‌کند و پوست سر را بدون خشکی پاک می‌سازد. حجم ۳۰۰ میلی‌لیتر.',
  introduce: `شامپو ضد ریزش مو بیوکسین مدل FORTE یکی از شناخته‌شده‌ترین محصولات خط مراقبت از موی برند بیوکسین است که به‌طور اختصاصی برای موهای مستعد ریزش فرموله شده است. این نسخه با نام FORTE عرضه می‌شود و نسبت به نسخه‌های معمول، غلظت بالاتری از ترکیبات گیاهی مؤثر دارد.

فرمول آن بر پایه‌ی عصاره‌های گیاهی و کمپلکس ویتامین‌های گروه B ساخته شده است؛ ترکیبی که گردش خون در پوست سر را تحریک می‌کند، فولیکول‌های ضعیف را تغذیه می‌کند و چرخه‌ی رشد مو را طولانی‌تر نگه می‌دارد. نتیجه‌ی استفاده‌ی منظم، کاهش محسوس ریزش در هنگام شست‌وشو و شانه‌کردن و افزایش تراکم تارهای مو است.

این شامپو بدون سدیم لوریل سولفات خشک‌کننده، بدون پارابن و بدون فتالات فرموله شده و برای پوست سر حساس نیز مناسب است. pH متعادل آن مانع خشکی و خارش پوست سر می‌شود و در عین حال چربی اضافی و باقی‌مانده‌ی محصولات حالت‌دهنده را به‌خوبی پاک می‌کند.

حجم ۳۰۰ میلی‌لیتر آن برای حدود دو تا سه ماه استفاده‌ی منظم کافی است. برای بهترین نتیجه، استفاده‌ی همزمان با لوسیون یا سرم ضد ریزش همان برند توصیه می‌شود.`,
  howToUse: `۱. موها و پوست سر را با آب ولرم کاملاً خیس کنید.

۲. مقدار مناسبی از شامپو (به اندازه‌ی یک فندق برای موی کوتاه و دو برابر برای موی بلند) را در کف دست رقیق کنید.

۳. شامپو را روی پوست سر ماساژ دهید و با نوک انگشتان به مدت ۲ تا ۳ دقیقه دور بزنید تا کف کند.

۴. اجازه دهید ۲ دقیقه روی پوست سر بماند تا ترکیبات گیاهی جذب شوند.

۵. با آب ولرم کاملاً آبکشی کنید. در صورت نیاز مرحله را تکرار کنید.

۶. برای نتیجه‌ی بهتر، هفته‌ای ۳ تا ۴ بار استفاده کنید و بعد از شست‌وشو از نرم‌کننده یا سرم ضد ریزش استفاده کنید.

توجه: تماس مستقیم با چشم را избеز کنید. در صورت تماس، با آب فراوان بشویید.`,
  specifications: [
    { key: 'برند', value: 'بیوکسین (Bioksin)' },
    { key: 'مدل', value: 'FORTE' },
    { key: 'نوع محصول', value: 'شامپو ضد ریزش مو' },
    { key: 'حجم', value: '۳۰۰ میلی‌لیتر' },
    { key: 'نوع مو', value: 'همه انواع مو، مناسب موی مستعد ریزش' },
    { key: 'فرمول', value: 'گیاهی، بدون پارابن، بدون فتالات، بدون SLS' },
    { key: 'pH', value: 'متعادل، مناسب پوست سر حساس' },
    { key: 'کشور سازنده', value: 'ترکیه' },
    { key: 'شرایط نگهداری', value: 'دور از نور مستقیم و رطوبت، در دمای اتاق' },
    { key: 'تاریخ انقضا', value: '۲۴ ماه پس از تولید' },
  ],
};

/* ------------------------------------------------------------------ */
/* Taxonomy                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_PATH = ['مراقبت از مو', 'شامپو', 'شامپو ضد ریزش مو'];

const BRAND = {
  name: 'بیوکسین',
  slug: 'bioksin',
  description:
    'بیوکسین (Bioksin) برند ترکیهای فعال در حوزه‌ی مراقبت تخصصی از مو است که بر فرمول‌های گیاهی ضد ریزش، تقویت‌کننده و مراقبت از پوست سر تمرکز دارد. محصولات این برند بدون پارابن و با ترکیبات گیاهی فرموله می‌شوند.',
};

const TAGS: Array<{ groupSlug: string; name: string; color?: string }> = [
  { groupSlug: 'nature', name: 'شامپو' },
  { groupSlug: 'nature', name: 'شامپو ضد ریزش' },
  { groupSlug: 'hair-type', name: 'موی مستعد ریزش' },
  { groupSlug: 'hair-type', name: 'موی نازک و ضعیف' },
  { groupSlug: 'hair-type', name: 'همه انواع مو' },
  { groupSlug: 'benefit', name: 'کاهش ریزش مو' },
  { groupSlug: 'benefit', name: 'تقویت فولیکول مو' },
  { groupSlug: 'benefit', name: 'افزایش تراکم مو' },
  { groupSlug: 'benefit', name: 'پاک‌سازی پوست سر' },
  { groupSlug: 'concern', name: 'ریزش مو' },
  { groupSlug: 'concern', name: 'موی نازک' },
  { groupSlug: 'concern', name: 'پوست سر چرب' },
  { groupSlug: 'feature', name: 'بدون پارابن' },
  { groupSlug: 'feature', name: 'بدون SLS' },
  { groupSlug: 'feature', name: 'فرمول گیاهی' },
  { groupSlug: 'feature', name: 'بدون فتالات' },
  { groupSlug: 'season', name: 'چهار فصل' },
  { groupSlug: 'brand-line', name: 'بیوکسین' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(value: string): string {
  return value
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .toLowerCase();
}

async function ensureCategoryPath(
  manager: EntityManager,
  path: string[],
): Promise<Categories> {
  let parent: Categories | null = null;

  for (const name of path) {
    const slug = slugify(name);
    let category = await manager.findOne(Categories, {
      where: { slug },
      loadEagerRelations: false,
    });

    if (!category) {
      category = manager.create(Categories, {
        name,
        slug,
        parent: parent ?? undefined,
      });
      category = await manager.save(Categories, category);
      console.log(`  + دسته‌بندی: ${name}`);
    } else {
      console.log(`  = دسته‌بندی موجود: ${name}`);
    }

    parent = category;
  }

  return parent!;
}

async function ensureBrand(manager: EntityManager): Promise<Brands> {
  let brand = await manager.findOne(Brands, {
    where: { slug: BRAND.slug },
    loadEagerRelations: false,
  });

  if (!brand) {
    brand = await manager.save(
      Brands,
      manager.create(Brands, {
        name: BRAND.name,
        slug: BRAND.slug,
        description: BRAND.description,
      }),
    );
    console.log(`  + برند: ${BRAND.name}`);
  } else {
    brand.name = BRAND.name;
    brand.description = BRAND.description;
    brand = await manager.save(Brands, brand);
    console.log(`  = برند به‌روزرسانی شد: ${BRAND.name}`);
  }

  return brand;
}

async function ensureTags(manager: EntityManager): Promise<Tags[]> {
  const groups = await manager.find(TagGroups, { loadEagerRelations: false });
  const bySlug = new Map(groups.map((g) => [g.slug, g]));
  const result: Tags[] = [];

  for (const [index, spec] of TAGS.entries()) {
    const group = bySlug.get(spec.groupSlug);
    if (!group) {
      console.warn(`  ! گروه تگ «${spec.groupSlug}» پیدا نشد، رد شد.`);
      continue;
    }

    let tag = await manager.findOne(Tags, {
      where: { groupId: group.id, name: spec.name },
      loadEagerRelations: false,
    });

    if (!tag) {
      tag = await manager.save(
        Tags,
        manager.create(Tags, {
          groupId: group.id,
          name: spec.name,
          slug: slugify(spec.name),
          color: spec.color ?? null,
          sortOrder: (index + 1) * 10,
          isActive: true,
        }),
      );
      console.log(`  + تگ: ${spec.name} (${group.name})`);
    } else {
      console.log(`  = تگ موجود: ${spec.name}`);
    }

    result.push(tag);
  }

  return result;
}

async function ensureVolumeAttribute(
  manager: EntityManager,
): Promise<Attributes> {
  let attribute = await manager.findOne(Attributes, {
    where: { name: PRODUCT.volumeAttributeName },
    loadEagerRelations: false,
  });

  if (!attribute) {
    attribute = await manager.save(
      Attributes,
      manager.create(Attributes, {
        name: PRODUCT.volumeAttributeName,
        label: PRODUCT.volumeAttributeName,
        kind: 'volume',
      }),
    );
    console.log(`  + ویژگی: ${PRODUCT.volumeAttributeName} (volume)`);
  } else {
    console.log(`  = ویژگی موجود: ${PRODUCT.volumeAttributeName}`);
  }

  return attribute;
}

async function ensureVolumeValue(
  manager: EntityManager,
  attribute: Attributes,
): Promise<AttributeValues> {
  let value = await manager.findOne(AttributeValues, {
    where: { attribute: { id: attribute.id }, value: PRODUCT.volumeLabel },
    loadEagerRelations: false,
  });

  if (!value) {
    value = await manager.save(
      AttributeValues,
      manager.create(AttributeValues, {
        attribute,
        value: PRODUCT.volumeLabel,
      }),
    );
    console.log(`  + مقدار: ${PRODUCT.volumeLabel}`);
  } else {
    console.log(`  = مقدار موجود: ${PRODUCT.volumeLabel}`);
  }

  return value;
}

function percent(price: number, discount: number): number {
  if (!discount || discount <= 0 || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100 * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

async function upsertProduct(
  manager: EntityManager,
  input: {
    category: Categories;
    brand: Brands;
    tags: Tags[];
    volumeValue: AttributeValues;
  },
): Promise<Products> {
  const { category, brand, tags, volumeValue } = input;

  let product = await manager.findOne(Products, {
    where: { sku: PRODUCT.sku },
    loadEagerRelations: false,
  });

  const base: Partial<Products> = {
    title: PRODUCT.title,
    englishTitle: PRODUCT.englishTitle,
    slug: PRODUCT.slug,
    sku: PRODUCT.sku,
    type: 'variant',
    category,
    brand,
    price: PRODUCT.price,
    priceDiscount: PRODUCT.priceDiscount,
    percentageDiscount: percent(PRODUCT.price, PRODUCT.priceDiscount),
    stock: PRODUCT.stock,
    isAvailable: true,
    isAmazingOffer: false,
    thumbnail: '',
    shortDescription: PRODUCT.shortDescription,
    introduce: PRODUCT.introduce,
    howToUse: PRODUCT.howToUse,
    specifications: PRODUCT.specifications,
    lowStockThreshold: PRODUCT.lowStockThreshold,
    tags,
  };

  if (!product) {
    product = manager.create(Products, base);
    product = await manager.save(Products, product);
    console.log(`  + محصول: ${PRODUCT.title} (id=${product.id})`);
  } else {
    Object.assign(product, base);
    product = await manager.save(Products, product);
    console.log(`  ~ محصول به‌روزرسانی شد (id=${product.id})`);
  }

  // --- single variant carrying the volume attribute --------------------
  const variantSku = `${PRODUCT.sku}-300`;
  let variant = await manager.findOne(ProductVariants, {
    where: { sku: variantSku },
    loadEagerRelations: false,
  });

  if (!variant) {
    variant = manager.create(ProductVariants, { product, sku: variantSku });
  }

  variant.product = product;
  variant.price = PRODUCT.price;
  variant.priceDiscount = PRODUCT.priceDiscount;
  variant.percentageDiscount = percent(PRODUCT.price, PRODUCT.priceDiscount);
  variant.stock = PRODUCT.stock;
  variant.isAvailable = true;
  variant.images = [];

  variant = await manager.save(ProductVariants, variant);
  variant.attributeValues = [volumeValue];
  await manager.save(ProductVariants, variant);

  console.log(`    ${PRODUCT.volumeLabel} → variant id=${variant.id}`);

  return product;
}

async function main(): Promise<void> {
  const ds: DataSource = await dataSource.initialize();
  console.log(`\n=== Seed: ${PRODUCT.title} ===`);
  console.log(
    `  db=${(ds.options as any).database} host=${(ds.options as any).host}\n`,
  );

  try {
    await ds.transaction(async (manager) => {
      console.log('[1/5] دسته‌بندی');
      const category = await ensureCategoryPath(manager, CATEGORY_PATH);

      console.log('\n[2/5] برند');
      const brand = await ensureBrand(manager);

      console.log('\n[3/5] تگ‌ها');
      const tags = await ensureTags(manager);

      console.log('\n[4/5] ویژگی حجم');
      const volumeAttribute = await ensureVolumeAttribute(manager);
      const volumeValue = await ensureVolumeValue(manager, volumeAttribute);

      console.log('\n[5/5] محصول و تنوع');
      const product = await upsertProduct(manager, {
        category,
        brand,
        tags,
        volumeValue,
      });

      console.log(`\n✓ محصول نهایی: id=${product.id} slug=${product.slug}`);
    });

    const counts = await ds.query(
      `SELECT (SELECT COUNT(*) FROM products) AS products,
              (SELECT COUNT(*) FROM product_variants) AS variants,
              (SELECT COUNT(*) FROM categories) AS categories,
              (SELECT COUNT(*) FROM brands) AS brands,
              (SELECT COUNT(*) FROM tags) AS tags`,
    );
    console.log('\n=== شمارش نهایی ===');
    console.table(counts[0]);
  } finally {
    await ds.destroy();
  }
}

main().catch((error) => {
  console.error('\n✗ Seed failed:', error);
  process.exit(1);
});