/**
 * Seeds the Essence I Love Extreme Crazy Volume mascara (12 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-essence-crazy-volume.ts
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
    'ریمل حجم‌دهنده اسنس مدل I Love Extreme Crazy Volume حجم ۱۲ میلی‌لیتر',
  englishTitle: 'Essence I Love Extreme Crazy Volume Mascara',
  sku: 'ESS-ILX-CRAZY-12',
  slug: 'essence-i-love-extreme-crazy-volume-mascara-12ml',
  volumeLabel: '۱۲ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  price: 360_000,
  priceDiscount: 0,
  stock: 50,
  lowStockThreshold: 10,
  shortDescription:
    'ریمل اسنس مدل I Love Extreme Crazy Volume با برس مخروطی رشته‌ای و فرمول مخصوص، حجمی غیرمعمول به مژه می‌دهد و ظاهری پرپشت و چشمگیر می‌سازد. نسخه‌ی ارتقایافته‌ی سری I Love Extreme با حجم بیشتر و رنگ مشکی عمیق. حجم ۱۲ میلی‌لیتر.',
  introduce: `ریمل اسنس مدل I Love Extreme Crazy Volume نسخه‌ی قدرتمندتر سری I Love Extreme است. تفاوت اصلی آن با مدل Volume در شدت اثر است: این نسخه برای کسانی ساخته شده که حجم معمولی برایشان کافی نیست و جلوه‌ی «بیش از اندازه» می‌خواهند.

نقطه‌ی تمایز این محصول، برس رشته‌ای و مخروطی آن است. شکل هندسی برس طوری طراحی شده که مژه‌ها را جدا از هم بگیرد و به هر کدام جداگانه محصول برساند؛ نتیجه این است که مژه‌ها به هم نمی‌چسبند اما هر یک به‌طور مستقل ضخیم می‌شود. این ترکیب، حجمی را ایجاد می‌کند که در ریمل‌های معمولی با برس‌های بزرگ‌تر به دست نمی‌آید.

فرمول آن بسیار غلیظ و به‌شدت رنگدانه‌دار است. پوشش مشکی آن از همان لایه‌ی اول کامل است و خط چشم طبیعی ایجاد می‌کند. به دلیل غلظت بالا، برداشتن محصول از تیوب نیاز به دقت دارد: برس را با چرخش آرام بیرون بکشید تا مقدار اضافی روی آن جمع نشود.

این ریمل برای استفاده‌ی روزمره هم مناسب است، اما اگر جلوه‌ی طبیعی می‌خواهید، یک لایه کافی است و لازم نیست روی نوک مژه‌ها کار کنید. برای شب و آرایش چشمگیر، دو لایه نتیجه‌ای می‌دهد که با اغلب ریمل‌های حرفه‌ای قابل مقایسه است.`,
  howToUse: `۱. مژه‌ها را تمیز و خشک نگه دارید؛ باقی‌مانده‌ی کرم یا چربی مانع چسبیدن فرمول می‌شود.

۲. برس را با حرکت چرخشی و آرام از تیوب خارج کنید. برس رشته‌ای این ریمل مقدار زیادی محصول نگه می‌دارد؛ اگر بیش از حد پوشیده بود، آن را روی لبه‌ی تیوب سبک کنید.

۳. برس را در ریشه‌ی مژه قرار دهید و با حرکت زیگزاگی کوتاه به سمت بالا بکشید تا هر مژه جداگانه پوشیده شود.

۴. برای جلوه‌ی طبیعی، همان یک لایه را کامل بگذارید و روی نوک‌ها کار نکنید.

۵. برای حجم حداکثری، پیش از خشک‌شدن کامل لایه‌ی اول، لایه‌ی دوم را اضافه کنید. از سه لایه بیشتر نزنید؛ مژه سنگین می‌شود و ریزش پیدا می‌کند.

۶. برای مژه‌های پایین، برس را عمودی بگیرید و با نوک آن کار کنید.

۷. برای پاک کردن، پد آغشته به پاک‌کننده‌ی آرایش چشم را چند ثانیه روی چشم نگه دارید، سپس به‌آرامی به پایین بکشید. مالش شدید به مژه آسیب می‌زند.

توجه: از تماس با چشم خودداری کنید. در صورت تماس، با آب فراوان بشویید. پس از هر بار استفاده درپوش را محکم ببندید. در دمای اتاق و دور از نور مستقیم نگهداری کنید.`,
  specifications: [
    { key: 'برند', value: 'اسنس (Essence)' },
    { key: 'مدل', value: 'I Love Extreme Crazy Volume' },
    { key: 'نوع محصول', value: 'ریمل حجم‌دهنده' },
    { key: 'حجم', value: '۱۲ میلی‌لیتر' },
    { key: 'رنگ', value: 'مشکی عمیق' },
    { key: 'نوع برس', value: 'برس رشته‌ای مخروطی' },
    { key: 'جلوه', value: 'حجم حداکثری و جداسازی مژه' },
    { key: 'ماندگاری', value: 'بلندمدت، مقاوم در برابر لکه‌شدن' },
    { key: 'مناسب برای', value: 'مژه‌های کم‌پشت، آرایش چشمگیر و شب' },
    { key: 'کشور سازنده', value: 'آلمان' },
    { key: 'شرایط نگهداری', value: 'در دمای اتاق، دور از نور مستقیم' },
  ],
};

/* ------------------------------------------------------------------ */
/* Taxonomy                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_PATH = ['لوازم آرایشی', 'آرایش چشم', 'ریمل'];

const BRAND = {
  name: 'اسنس',
  slug: 'essence',
  description:
    'اسنس (Essence) برند آلمانی محصولات آرایشی است که با قیمت مناسب و کیفیت قابل‌اتکا در بازار جهانی شناخته می‌شود. خط ریمل این برند، به‌ویژه سری I Love Extreme، از پرفروش‌ترین ریمل‌های ارزان‌قیمت دنیاست و بر حجم‌دهی قوی و پوشش پیگمنت‌دار تمرکز دارد.',
};

const TAGS: Array<{ groupSlug: string; name: string; color?: string }> = [
  { groupSlug: 'nature', name: 'ریمل' },
  { groupSlug: 'nature', name: 'ریمل حجم‌دهنده' },
  { groupSlug: 'benefit', name: 'حجم‌دهی به مژه' },
  { groupSlug: 'benefit', name: 'پرپشتی مژه' },
  { groupSlug: 'benefit', name: 'جلوه چشم درشت‌تر' },
  { groupSlug: 'benefit', name: 'پوشش پیگمنت‌دار' },
  { groupSlug: 'benefit', name: 'جداسازی مژه' },
  { groupSlug: 'concern', name: 'مژه کم‌پشت' },
  { groupSlug: 'concern', name: 'مژه نازک و کوتاه' },
  { groupSlug: 'feature', name: 'برس رشته‌ای' },
  { groupSlug: 'feature', name: 'قابل لایه‌گذاری' },
  { groupSlug: 'feature', name: 'رنگ مشکی عمیق' },
  { groupSlug: 'feature', name: 'ماندگاری بلندمدت' },
  { groupSlug: 'season', name: 'چهار فصل' },
  { groupSlug: 'brand-line', name: 'اسنس' },
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
  const variantSku = `${PRODUCT.sku}-12`;
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