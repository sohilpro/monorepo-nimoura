/**
 * Seeds the Essence I Love Extreme volume mascara (12 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-essence-extreme.ts
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
    'ریمل حجم‌دهنده اسنس مدل I Love Extreme Volume حجم ۱۲ میلی‌لیتر',
  englishTitle: 'Essence I Love Extreme Mascara',
  sku: 'ESS-ILX-VOL-12',
  slug: 'essence-i-love-extreme-volume-mascara-12ml',
  volumeLabel: '۱۲ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  price: 340_000,
  priceDiscount: 0,
  stock: 55,
  lowStockThreshold: 10,
  shortDescription:
    'ریمل حجم‌دهنده اسنس مدل I Love Extreme Volume با برس حجیم مخصوص، حجمی چند برابر به مژه می‌دهد و ظاهری پرپشت و درشت می‌سازد. نتیجه‌ی یک لایه هم چشمگیر است و رنگ مشکی عمیق آن تا پایان روز ثابت می‌ماند. حجم ۱۲ میلی‌لیتر.',
  introduce: `ریمل اسنس مدل I Love Extreme Volume یکی از شناخته‌شده‌ترین محصولات برند اسنس آلمان است و به‌طور خاص برای حجم دادن ساخته شده — نه بلند کردن. کل طراحی آن روی این است که مژه‌ها پرپشت، ضخیم و از ریشه پوشیده به نظر برسند.

نقطه‌ی تمایز آن، برس است. برس این ریمل از ریمل‌های معمولی بزرگ‌تر و پرزدارتر است؛ ساختاری شبیه یک استوانه‌ی متراکم که مقدار زیادی محصول روی خود نگه می‌دارد. موقع کشیدن، این حجم محصول به‌سرعت روی مژه منتقل می‌شود و همان لایه‌ی اول جلوه‌ای می‌دهد که با ریمل‌های معمولی بعد از سه لایه هم به دست نمی‌آید.

فرمول آن غلیظ و به‌شدت پیگمنت‌دار است. رنگدانه‌ی مشکی عمیق آن، فاصله‌ی بین مژه‌ها را پر می‌کند و خط چشم طبیعی ایجاد می‌کند. علیرغم غلظت، اگر برس را به‌درستی از تیوب بیرون بکشید، محصول به‌طور یکنواخت روی مژه پخش می‌شود و کلوخه نمی‌شود.

این ریمل برای افرادی مناسب است که مژه‌ی کم‌پشت یا نازک دارند و می‌خواهند در زمان کوتاه به جلوه‌ی چشمگیر برسند. برای جلوه‌ی طبیعی‌تر، مقدار کمتری از محصول رو برس استفاده کنید یا لایه را با نوک برس روی نوک مژه‌ها محدود کنید.`,
  howToUse: `۱. پیش از استفاده، مطمئن شوید مژه‌ها تمیز و خشک هستند.

۲. برس را به‌آرامی و با چرخش از تیوب خارج کنید. برس بزرگ این ریمل مقدار زیادی محصول برمی‌دارد؛ اگر برس با تکه‌های اضافی پوشیده بود، لبه‌ی تیوب را با آن تمیز کنید.

۳. برس را در ریشه‌ی مژه قرار دهید. برای ایجاد حجم، برس را کمی روی ریشه فشار دهید و به‌صورت زیگزاگی به سمت بالا بکشید.

۴. برای جلوه‌ی طبیعی‌تر، یک لایه با حرکت مستقیم به بالا بکشید و روی نوک مژه‌ها کار نکنید.

۵. برای حجم بیشتر، پیش از خشک شدن کامل لایه‌ی اول، لایه‌ی دوم را اضافه کنید. بیش از دو لایه معمولاً باعث سنگین‌شدن مژه می‌شود.

۶. برای پاک کردن، از پاک‌کننده‌ی آرایش چشم استفاده کنید و با پد آرایشی چند ثانیه روی چشم نگه دارید تا محصول نرم شود، سپس به‌آرامی پاک کنید. با هر بار استفاده درپوش را محکم ببندید.

توجه: از تماس با چشم خودداری کنید. در صورت تماس، با آب فراوان بشویید. در دمای اتاق و دور از نور مستقیم نگهداری کنید.`,
  specifications: [
    { key: 'برند', value: 'اسنس (Essence)' },
    { key: 'مدل', value: 'I Love Extreme Volume' },
    { key: 'نوع محصول', value: 'ریمل حجم‌دهنده' },
    { key: 'حجم', value: '۱۲ میلی‌لیتر' },
    { key: 'رنگ', value: 'مشکی عمیق' },
    { key: 'نوع برس', value: 'برس حجیم و متراکم' },
    { key: 'جلوه', value: 'حجم بالا و پرپشتی مژه' },
    { key: 'ماندگاری', value: 'بلندمدت، مقاوم در برابر لکه‌شدن' },
    { key: 'مناسب برای', value: 'مژه‌های کم‌پشت و نازک، آرایش چشمگیر' },
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
  { groupSlug: 'concern', name: 'مژه کم‌پشت' },
  { groupSlug: 'concern', name: 'مژه نازک و کوتاه' },
  { groupSlug: 'feature', name: 'برس حجیم' },
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