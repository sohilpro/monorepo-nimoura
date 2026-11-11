/**
 * Seeds the Olibolla Lip Glass product with its 8 colour variants.
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-olibolla.ts
 */
import { DataSource, EntityManager } from 'typeorm';
import { Attributes } from '../src/modules/products/entities/attributes.entity';
import { AttributeValues } from '../src/modules/products/entities/attribute-values.entity';
import { Brands } from '../src/modules/brands/entities/brands.entity';
import { SubBrands } from '../src/modules/brands/entities/sub-brands.entity';
import { Categories } from '../src/modules/categories/entities/categories.entity';
import { ProductVariants } from '../src/modules/products/entities/product-variants.entity';
import { Products } from '../src/modules/products/entities/products.entity';
import { Tags } from '../src/modules/tags/entities/tags.entity';
import type {
  BrandSeedInput,
  SubBrandSeedInput,
  TagSeedSpec,
} from './lib/product-seed.helper';
import {
  ensureAttribute,
  ensureAttributeValue,
  ensureBrand,
  ensureCategoryPath,
  ensureSubBrand,
  ensureTags,
  formatRichTextHtml,
  percent,
  runStandaloneSeed,
} from './lib/product-seed.helper';

/* ------------------------------------------------------------------ */
/* Colour palette sampled from the product sheet                       */
/* ------------------------------------------------------------------ */

interface ColourVariant {
  code: string;
  name: string;
  englishName: string;
  hex: string;
  description: string;
}

const COLOURS: ColourVariant[] = [
  {
    code: '01',
    name: 'شفاف براق',
    englishName: 'Clear Gloss',
    hex: '#E8E1E3',
    description: 'بیرنگ و شفاف؛ براقیت خالص بدون هیچ رنگی روی لب.',
  },
  {
    code: '02',
    name: 'مرجانی گرم',
    englishName: 'Warm Coral',
    hex: '#E2605A',
    description: 'نارنجی-قرمز گرم با ته‌مایه‌ی مرجانی، مناسب پوست‌های گرم.',
  },
  {
    code: '03',
    name: 'صورتی چرک',
    englishName: 'Dusty Pink',
    hex: '#D06C88',
    description: 'صورتی مات و آرام با ته‌مایه‌ی خاکستری؛ انتخاب روزمره.',
  },
  {
    code: '04',
    name: 'رز کهنه',
    englishName: 'Vintage Rose',
    hex: '#B85A6C',
    description: 'رز تیره و کمی سرد؛ حالت لب را طبیعی‌تر نشان می‌دهد.',
  },
  {
    code: '05',
    name: 'نودی برنزی',
    englishName: 'Bronze Nude',
    hex: '#A8603F',
    description: 'نودی گرم با درخشش برنزی برای پوست‌های سبزه و گندمی.',
  },
  {
    code: '06',
    name: 'قرمز آتشین',
    englishName: 'Fire Red',
    hex: '#D4232E',
    description: 'قرمز خالص و اشباع؛ پررنگ‌ترین رنگ مجموعه.',
  },
  {
    code: '07',
    name: 'تمشکی',
    englishName: 'Berry',
    hex: '#A61A3E',
    description: 'صورتی-قرمز عمیق با ته‌مایه‌ی تمشک؛ مناسب شب.',
  },
  {
    code: '08',
    name: 'زرشکی مخملی',
    englishName: 'Velvet Maroon',
    hex: '#6B1A12',
    description: 'زرشکی تیره و مخملی؛ تیره‌ترین رنگ مجموعه.',
  },
];

/* ------------------------------------------------------------------ */
/* Product copy                                                       */
/* ------------------------------------------------------------------ */

const PRODUCT = {
  title: 'لیپ گلاس اولیبولا',
  englishTitle: 'Olibolla Lip Glass',
  sku: 'OLB-LG-001',
  slug: 'olibolla-lip-glass',
  price: 390_000,
  priceDiscount: 0,
  stockPerVariant: 50,
  lowStockThreshold: 10,
  shortDescription:
    'لیپ گلاس اولیبولا با بافتی سبک و غیرچسبنده، درخششی آینه‌ای روی لب ایجاد می‌کند و آن را نرم و مرطوب نگه می‌دارد. در هشت رنگ از شفاف براق تا زرشکی مخملی.',
  introduce: `لیپ گلاس اولیبولا یک براق‌کننده‌ی لب با فرمول سبک و آب‌گونه است که بدون سنگینی و بدون احساس چسبندگی، درخششی شفاف و آینه‌ای روی لب می‌سازد.

بافت این لیپ گلاس از روغن‌های گیاهی سبک و ویتامین E ساخته شده است؛ ترکیبی که لب را نرم می‌کند، خشکی و ترک‌های ریز را کم‌رنگ می‌کند و در طول روز رطوبت را در سطح لب نگه می‌دارد. رنگدانه‌ها در عین شفافیت، پوشش یکنواخت و قابل‌لایه‌گذاری دارند: یک لایه برای جلوه‌ی طبیعی و چند لایه برای رنگی پررنگ‌تر.

این محصول برای استفاده‌ی روزمره روی لب برهنه، روی رژ لب مات برای اضافه‌کردن درخشش، و روی خط لب برای حجم‌دادن به ظاهر لب طراحی شده است. فرمول آن بدون عطر قوی و بدون الکل خشک‌کننده است و برای لب‌های حساس هم مناسب است.

مجموعه‌ی هشت‌رنگ آن از شفاف براق شروع می‌شود و تا زرشکی مخملی ادامه دارد؛ هر رنگ با کد اختصاصی خود در صفحه‌ی محصول قابل انتخاب است.`,
  howToUse: `۱. مطمئن شوید لب‌ها تمیز و خشک هستند.

۲. اپلیکاتور را از تیوب خارج کنید و یک لایه‌ی نازک از مرکز لب به سمت گوشه‌ها بکشید.

۳. برای رنگ پررنگ‌تر، اجازه دهید لایه‌ی اول چند ثانیه بنشیند و سپس لایه‌ی دوم را اضافه کنید.

۴. برای جلوه‌ی پرتر، یک لایه‌ی نازک روی رژ لب مات بزنید.

۵. در طول روز در صورت نیاز تجدید کنید. برای حفظ بافت، پس از استفاده درپوش را محکم ببندید.`,
  specifications: [
    { key: 'برند', value: 'اولیبولا (Olibolla)' },
    { key: 'نوع محصول', value: 'لیپ گلاس (براق‌کننده لب)' },
    { key: 'حجم', value: '۱۲ میلی‌لیتر' },
    { key: 'بافت', value: 'شفاف، سبک، غیرچسبنده' },
    { key: 'جلوه', value: 'براق آینه‌ای' },
    { key: 'تعداد رنگ', value: '۸ رنگ' },
    { key: 'کشور سازنده', value: 'چین' },
    { key: 'مناسب برای', value: 'همه انواع پوست لب' },
    { key: 'فرمول', value: 'بدون الکل خشک‌کننده، حاوی ویتامین E' },
  ],
};

/* ------------------------------------------------------------------ */
/* Taxonomy                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_PATH = ['لوازم آرایشی', 'آرایش لب', 'لیپ گلاس'];

const BRAND: BrandSeedInput = {
  name: 'اولیبولا',
  slug: 'olibolla',
  description:
    'اولیبولا (Olibolla) برندی فعال در حوزه‌ی محصولات آرایش لب است که بر بافت‌های سبک، رنگدانه‌های شفاف و فرمول‌های مرطوب‌کننده تمرکز دارد.',
};

const SUB_BRAND: SubBrandSeedInput = {
  name: 'لیپ گلاس اولیبولا',
  slug: 'olibolla-lip-glass',
};

const TAGS: TagSeedSpec[] = [
  { groupSlug: 'nature', name: 'لیپ گلاس' },
  { groupSlug: 'nature', name: 'براق‌کننده لب' },
  { groupSlug: 'feature', name: 'بافت سبک' },
  { groupSlug: 'feature', name: 'غیرچسبنده' },
  { groupSlug: 'feature', name: 'براق آینه‌ای' },
  { groupSlug: 'feature', name: 'ماندگاری متوسط' },
  { groupSlug: 'benefit', name: 'آبرسانی لب' },
  { groupSlug: 'benefit', name: 'کاهش ترک‌خوردگی' },
  { groupSlug: 'benefit', name: 'ظاهر حجیم‌تر' },
  { groupSlug: 'concern', name: 'خشکی لب' },
  { groupSlug: 'season', name: 'چهار فصل' },
  { groupSlug: 'brand-line', name: 'اولیبولا' },
];

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

async function upsertProduct(
  manager: EntityManager,
  input: {
    category: Categories;
    brand: Brands;
    subBrand: SubBrands;
    tags: Tags[];
    colourAttribute: Attributes;
    colourValues: AttributeValues[];
  },
): Promise<Products> {
  const { category, brand, subBrand, tags, colourAttribute, colourValues } =
    input;

  let product = await manager.findOne(Products, {
    where: [{ sku: PRODUCT.sku }, { slug: PRODUCT.slug }],
    relations: { tags: true },
    withDeleted: true,
    loadEagerRelations: false,
  });

  if (product?.deletedAt) {
    await manager.restore(Products, product.id);
    product.deletedAt = undefined;
  }

  const base: Partial<Products> = {
    title: PRODUCT.title,
    englishTitle: PRODUCT.englishTitle,
    slug: PRODUCT.slug,
    sku: PRODUCT.sku,
    type: 'variant',
    category,
    brand,
    subBrand,
    price: PRODUCT.price,
    priceDiscount: PRODUCT.priceDiscount,
    percentageDiscount: percent(PRODUCT.price, PRODUCT.priceDiscount),
    stock: COLOURS.length * PRODUCT.stockPerVariant,
    isAvailable: true,
    isAmazingOffer: false,
    thumbnail: product?.thumbnail || '',
    shortDescription: PRODUCT.shortDescription,
    introduce: formatRichTextHtml(PRODUCT.introduce),
    howToUse: formatRichTextHtml(PRODUCT.howToUse),
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

  // --- variants -------------------------------------------------------
  const existing = await manager.find(ProductVariants, {
    where: { product: { id: product.id } },
    relations: { attributeValues: { attribute: true } },
    withDeleted: true,
    loadEagerRelations: false,
  });
  const existingByValue = new Map<string, ProductVariants>();
  for (const v of existing) {
    const colourValue = v.attributeValues?.find(
      (av) => av.attribute?.name === colourAttribute.name,
    );
    if (colourValue) existingByValue.set(colourValue.value, v);
  }

  for (const [index, colour] of COLOURS.entries()) {
    const attributeValue = colourValues[index];
    const sku = `${PRODUCT.sku}-${colour.code}`;
    let variant = existingByValue.get(colour.name);

    if (!variant) {
      variant = await manager.findOne(ProductVariants, {
        where: { sku },
        relations: { attributeValues: { attribute: true } },
        withDeleted: true,
        loadEagerRelations: false,
      }) ?? undefined;
    }

    if (!variant) {
      variant = manager.create(ProductVariants, {
        product,
        sku,
      });
    } else if (variant.deletedAt) {
      await manager.restore(ProductVariants, variant.id);
      variant.deletedAt = undefined;
    }

    variant.product = product;
    variant.sku = sku;
    variant.price = PRODUCT.price;
    variant.priceDiscount = PRODUCT.priceDiscount;
    variant.percentageDiscount = percent(PRODUCT.price, PRODUCT.priceDiscount);
    variant.stock = PRODUCT.stockPerVariant;
    variant.isAvailable = true;
    variant.images = variant.images?.length ? variant.images : [];

    variant = await manager.save(ProductVariants, variant);

    // join table is owned by ProductVariants.attributeValues
    variant.attributeValues = [attributeValue];
    await manager.save(ProductVariants, variant);

    console.log(`    ${colour.code} ${colour.name} → ${colour.hex} (variant id=${variant.id})`);
  }

  // remove colour variants that are no longer part of the palette
  const keepSkus = new Set(COLOURS.map((c) => `${PRODUCT.sku}-${c.code}`));
  const stale = existing.filter((v) => !keepSkus.has(v.sku) && !v.deletedAt);
  if (stale.length) {
    await manager.remove(ProductVariants, stale);
    console.log(`  - ${stale.length} تنوع قدیمی حذف شد`);
  }

  return product;
}

export async function seed(ds: DataSource): Promise<void> {
  await ds.transaction(async (manager) => {
    console.log('[1/5] دسته‌بندی');
    const category = await ensureCategoryPath(manager, CATEGORY_PATH);

    console.log('\n[2/5] برند و زیربرند');
    const brand = await ensureBrand(manager, BRAND);
    const subBrand = await ensureSubBrand(manager, brand, SUB_BRAND);

    console.log('\n[3/5] تگ‌ها');
    const tags = await ensureTags(manager, TAGS);

    console.log('\n[4/5] ویژگی رنگ');
    const colourAttribute = await ensureAttribute(manager, {
      name: 'رنگ',
      label: 'رنگ',
      kind: 'color',
    });
    const colourValues: AttributeValues[] = [];
    for (const colour of COLOURS) {
      colourValues.push(
        await ensureAttributeValue(manager, colourAttribute, {
          value: colour.name,
          colorHex: colour.hex,
        }),
      );
    }

    console.log('\n[5/5] محصول و تنوع‌ها');
    const product = await upsertProduct(manager, {
      category,
      brand,
      subBrand,
      tags,
      colourAttribute,
      colourValues,
    });

    console.log(`\n✓ محصول نهایی: id=${product.id} slug=${product.slug}`);
  });
}

if (require.main === module) {
  runStandaloneSeed(PRODUCT.title, seed);
}