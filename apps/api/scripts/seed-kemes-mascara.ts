/**
 * Seeds the Kemes Fashion volumising & lengthening mascara (11 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-kemes-mascara.ts
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
    'ریمل حجم‌دهنده و بلندکننده کمس مدل Fashion حجم ۱۱ میلی‌لیتر',
  englishTitle: 'Kemes Fashion Volumizing & Lengthening Mascara 11 ml',
  sku: 'KEM-MASC-FASH-11',
  slug: 'kemes-fashion-volumizing-lengthening-mascara-11ml',
  volumeLabel: '۱۱ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  price: 285_000,
  priceDiscount: 0,
  stock: 45,
  lowStockThreshold: 10,
  shortDescription:
    'ریمل کمس مدل Fashion با برس مخروطی و فرمول غنی، مژه‌ها را از ریشه ضخیم می‌کند و تا نوک بلند می‌کشد. نتیجه‌ی آن حجم چشمگیر بدون گلوله‌شدن، مقاوم در برابر رطوبت و مناسب استفاده‌ی روزانه. حجم ۱۱ میلی‌لیتر.',
  introduce: `ریمل کمس مدل Fashion یکی از پرفروش‌ترین ریمل‌های اقتصادی برند کمس است که به‌طور همزمان دو کار انجام می‌دهد: مژه را ضخیم می‌کند و آن را بلند می‌کشد. بسیاری از ریمل‌ها یکی از این دو را فدای دیگری می‌کنند، اما فرمول و برس این محصول طوری طراحی شده که هر دو نتیجه را با هم بدهد.

برس مخروطی آن با پرزهای ریز و متراکم ساخته شده است. این شکل هندسی باعث می‌شود برس به ریشه‌ی مژه برسد، مقدار مناسبی محصول را از تیوب برداشت کند و آن را بدون کلوخه‌شدن روی طول مژه پخش کند. ریشه‌ی مژه ضخامت می‌گیرد و نوک آن کشیده می‌شود — همان جلوه‌ای که در ریمل‌های حرفه‌ای دنبالش هستید.

فرمول آن نسبتاً غلیظ اما قابل‌کنترل است. لایه‌ی اول پوشش پایه می‌دهد و لایه‌های بعدی حجم را افزایش می‌دهند، بدون اینکه مژه سنگین و شکننده شود. خشک‌شدن آن نسبتاً سریع است، پس بین لایه‌ها نیازی به انتظار طولانی نیست.

این ریمل در برابر رطوبت و عرق مقاوم است و در طول روز ریزش نمی‌دهد؛ برای استفاده‌ی روزمره، محل کار و حتی هوای مرطوب مناسب است. رنگ مشکی عمیق آن با هر رنگ چشم و هر سبک آرایشی هماهنگ می‌شود. برای پاک کردن، آب گرم و شامپو بچه یا پاک‌کننده‌ی آرایش چشم کافی است.`,
  howToUse: `۱. پیش از استفاده، مطمئن شوید مژه‌ها تمیز و خشک هستند و چربی یا کرم روی آن‌ها نمانده است.

۲. برس را از تیوب خارج کنید. برای برداشتن مقدار مناسب، آن را به‌آرامی و چرخشی بیرون بکشید؛ بیرون کشیدن سریع، محصول اضافی روی برس جمع می‌کند و باعث گلوله‌شدن می‌شود.

۳. برس را در پایه‌ی مژه‌ها قرار دهید و با حرکت زیگزاگی کوتاه به سمت بالا بکشید. این حرکت ریشه‌ها را پر می‌کند و از چسبیدن مژه‌ها به هم جلوگیری می‌کند.

۴. برای حجم بیشتر، پیش از خشک‌شدن کامل لایه‌ی اول، لایه‌ی دوم را اضافه کنید. برای جلوه‌ی طبیعی، همان یک لایه کافی است.

۵. برای مژه‌های پایین، برس را عمودی نگه دارید و با نوک آن کار کنید.

۶. برای پاک کردن، از پاک‌کننده‌ی آرایش چشم بدون کشیدن و مالش شدید استفاده کنید. پس از هر بار استفاده، درپوش را محکم ببندید تا فرمول خشک نشود.

توجه: از تماس با چشم خودداری کنید. در صورت تماس، با آب فراوان بشویید. در دمای اتاق و دور از نور مستقیم نگهداری کنید.`,
  specifications: [
    { key: 'برند', value: 'کمس (Kemes)' },
    { key: 'مدل', value: 'Fashion' },
    { key: 'نوع محصول', value: 'ریمل حجم‌دهنده و بلندکننده' },
    { key: 'حجم', value: '۱۱ میلی‌لیتر' },
    { key: 'رنگ', value: 'مشکی' },
    { key: 'نوع برس', value: 'مخروطی با پرز متراکم' },
    { key: 'جلوه', value: 'حجم بالا و بلندشدن مژه' },
    { key: 'ماندگاری', value: 'بلندمدت، مقاوم در برابر رطوبت' },
    { key: 'مناسب برای', value: 'همه انواع مژه، از جمله مژه‌های کم‌پشت' },
    { key: 'کشور سازنده', value: 'چین' },
    { key: 'شرایط نگهداری', value: 'در دمای اتاق، دور از نور مستقیم' },
  ],
};

/* ------------------------------------------------------------------ */
/* Taxonomy                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_PATH = ['لوازم آرایشی', 'آرایش چشم', 'ریمل'];

const BRAND = {
  name: 'کمس',
  slug: 'kemes',
  description:
    'کمس (Kemes Cosmetics) برندی در حوزه‌ی محصولات آرایشی ارزان‌قیمت است که بر ریمل، خط چشم و محصولات آرایش چشم تمرکز دارد. محصولات این برند با بسته‌بندی رنگی و فرمول‌های قابل‌کنترل، گزینه‌ای مقرون‌به‌صرفه برای استفاده‌ی روزمره هستند.',
};

const TAGS: Array<{ groupSlug: string; name: string; color?: string }> = [
  { groupSlug: 'nature', name: 'ریمل' },
  { groupSlug: 'nature', name: 'ریمل حجم‌دهنده' },
  { groupSlug: 'nature', name: 'ریمل بلندکننده' },
  { groupSlug: 'benefit', name: 'حجم‌دهی به مژه' },
  { groupSlug: 'benefit', name: 'بلندکنندگی مژه' },
  { groupSlug: 'benefit', name: 'ضخیم‌کردن ریشه مژه' },
  { groupSlug: 'benefit', name: 'جلوه چشم درشت‌تر' },
  { groupSlug: 'concern', name: 'مژه کم‌پشت' },
  { groupSlug: 'concern', name: 'مژه نازک و کوتاه' },
  { groupSlug: 'feature', name: 'ضد رطوبت' },
  { groupSlug: 'feature', name: 'بدون ریزش' },
  { groupSlug: 'feature', name: 'برس مخروطی' },
  { groupSlug: 'feature', name: 'قابل لایه‌گذاری' },
  { groupSlug: 'season', name: 'چهار فصل' },
  { groupSlug: 'brand-line', name: 'کمس' },
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
  const variantSku = `${PRODUCT.sku}-11`;
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