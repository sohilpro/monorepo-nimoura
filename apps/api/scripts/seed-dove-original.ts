/**
 * Seeds the Dove Original Woman anti-perspirant spray (250 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-dove-original.ts
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
  title:
    'اسپری ضد تعریق داو مدل Original حجم ۲۵۰ میلی‌لیتر (Dove Original Woman Anti-Perspirant Spray)',
  englishTitle: 'Dove Original Woman Anti-Perspirant Spray 250 ml',
  sku: 'DOVE-AP-ORIG-250',
  slug: 'dove-original-woman-anti-perspirant-spray-250ml',
  volumeLabel: '۲۵۰ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  price: 520_000,
  priceDiscount: 0,
  stock: 60,
  lowStockThreshold: 10,
  shortDescription:
    'اسپری ضد تعریق داو مدل Original با کرم مرطوب‌کننده‌ی فشرده، ۴۸ ساعت محافظت در برابر تعریق و بوی بد را فراهم می‌کند و پوست زیر بغل را نرم و خشک نگه می‌دارد. بدون الکل، حجم ۲۵۰ میلی‌لیتر.',
  introduce: `اسپری ضد تعریق داو مدل Original یکی از پرفروش‌ترین محصولات خط ضد تعریق برند داو است که با فرمول اختصاصی «Moisturising Cream» خود شناخته می‌شود. این فرمول ترکیبی از مواد مرطوب‌کننده با عوامل ضد تعریق است؛ به همین دلیل در کنار توقف تعریق، پوست زیر بغل را در طول روز نرم نگه می‌دارد و از خشکی، کشیدگی و سوزش جلوگیری می‌کند.

محافظت این اسپری تا ۴۸ ساعت ادامه دارد. یعنی یک بار استفاده در صبح، برای پوستی که به‌طور معمول دچار تعریق متوسط است، تا پایان روز بعد کافی است. ترکیبات ضد تعریق آن با انسداد موقت مجاری غدد عرق، مقدار تعریق را کاهش می‌دهند؛ نه اینکه فقط بوی آن را بپوشانند.

این محصول بدون الکل فرموله شده است. برای پوست زیر بغل که یکی از حساس‌ترین نواحی بدن است و دائماً در معرض تراشیدن و اصطکاک قرار دارد، این نکته مهم است: فرمول‌های حاوی الکل می‌توانند پس از اصلاح باعث سوزش و التهاب شوند، در حالی که نسخه‌ی بدون الکل داو این مشکل را ندارد.

بوی آن، رایحه‌ی کلاسیک و شناخته‌شده‌ی Original داو است؛ بوی صابونی-گلی ملایم که پس از خشک شدن روی پوست، رایحه‌ای تمیز و ملایم باقی می‌گذارد و با اکثر عطرها تداخل نمی‌کند.`,
  howToUse: `۱. پیش از استفاده، پوست زیر بغل باید کاملاً تمیز و خشک باشد. رطوبت روی پوست، جذب فرمول را کاهش می‌دهد و ممکن است لکه‌ی سفید باقی بگذارد.

۲. قوطی را در فاصله‌ی حدود ۱۵ سانتی‌متری پوست نگه دارید.

۳. به مدت ۲ تا ۳ ثانیه روی هر زیر بغل اسپری کنید. اسپری کردن بیش از حد، فایده‌ای ندارد و فقط مصرف را بالا می‌برد.

۴. اجازه دهید چند ثانیه خشک شود و سپس لباس بپوشید.

۵. بهترین زمان استفاده، شب قبل از خواب است، زمانی که غدد عرق کمتر فعال هستند و ترکیب ضد تعریق زمان کافی برای نفوذ به مجاری عرق دارد.

۶. برای یک بار در روز استفاده شود؛ تجدید به‌طور معمول لازم نیست.

توجه: از استعمال روی پوست آسیب‌دیده، زخمی یا تازه اصلاح‌شده خودداری کنید. از تماس با چشم و استنشاق مستقیم پرهیز کنید. دور از دسترس کودکان و از حرارت بالای ۵۰ درجه نگه دارید.`,
  specifications: [
    { key: 'برند', value: 'داو (Dove)' },
    { key: 'مدل', value: 'Original Woman' },
    { key: 'نوع محصول', value: 'اسپری ضد تعریق و ضد عرق' },
    { key: 'حجم', value: '۲۵۰ میلی‌لیتر' },
    { key: 'مدت محافظت', value: 'تا ۴۸ ساعت' },
    { key: 'فرمول', value: 'دارای کرم مرطوب‌کننده، بدون الکل' },
    { key: 'نوع پوست', value: 'مناسب همه انواع پوست، از جمله پوست حساس' },
    { key: 'جنسیت', value: 'زنانه' },
    { key: 'رایحه', value: 'Original کلاسیک داو' },
    { key: 'کشور سازنده', value: 'ترکیه' },
    { key: 'شرایط نگهداری', value: 'دور از حرارت مستقیم بالای ۵۰ درجه، در جای خشک' },
  ],
};

/* ------------------------------------------------------------------ */
/* Taxonomy                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_PATH = ['مراقبت شخصی', 'ضد تعریق و ضد عرق', 'اسپری ضد تعریق'];

const BRAND = {
  name: 'داو',
  slug: 'dove',
  description:
    'داو (Dove) یکی از شناخته‌شده‌ترین برندهای جهانی در حوزه‌ی مراقبت از پوست و بدن است که بر فرمول‌های ملایم، مرطوب‌کننده و بدون خشکی تمرکز دارد. خط ضد تعریق این برند با کرم مرطوب‌کننده‌ی مخصوص خود، استانداردی متمایز در این دسته ایجاد کرده است.',
};

const TAGS: Array<{ groupSlug: string; name: string; color?: string }> = [
  { groupSlug: 'nature', name: 'اسپری ضد تعریق' },
  { groupSlug: 'nature', name: 'ضد تعریق و ضد عرق' },
  { groupSlug: 'benefit', name: 'محافظت ۴۸ ساعته' },
  { groupSlug: 'benefit', name: 'آبرسانی پوست' },
  { groupSlug: 'benefit', name: 'جلوگیری از بوی بد' },
  { groupSlug: 'benefit', name: 'پوست نرم و خشک' },
  { groupSlug: 'concern', name: 'تعریق زیاد' },
  { groupSlug: 'concern', name: 'پوست حساس زیر بغل' },
  { groupSlug: 'concern', name: 'سوزش بعد از اصلاح' },
  { groupSlug: 'feature', name: 'بدون الکل' },
  { groupSlug: 'feature', name: 'دارای کرم مرطوب‌کننده' },
  { groupSlug: 'feature', name: 'فرمول ملایم' },
  { groupSlug: 'feature', name: 'اسپری ریزپاش' },
  { groupSlug: 'season', name: 'چهار فصل' },
  { groupSlug: 'brand-line', name: 'داو' },
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

  // --- one variant carrying the volume attribute -----------------------
  const variantSku = `${PRODUCT.sku}-250`;
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