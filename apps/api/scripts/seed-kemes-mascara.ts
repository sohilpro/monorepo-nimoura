/**
 * Seeds the Kemes Fashion volumising & lengthening mascara (11 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-kemes-mascara.ts
 */
import { DataSource } from 'typeorm';
import type {
  BrandSeedInput,
  SingleVolumeProductSeedInput,
  SubBrandSeedInput,
  TagSeedSpec,
} from './lib/product-seed.helper';
import {
  runStandaloneSeed,
  seedSingleVolumeProduct,
} from './lib/product-seed.helper';

/* ------------------------------------------------------------------ */
/* Product copy                                                       */
/* ------------------------------------------------------------------ */

const PRODUCT: SingleVolumeProductSeedInput = {
  title:
    'ریمل حجم‌دهنده و بلندکننده کمس مدل Fashion حجم ۱۱ میلی‌لیتر',
  englishTitle: 'Kemes Fashion Volumizing & Lengthening Mascara 11 ml',
  sku: 'KEM-MASC-FASH-11',
  slug: 'kemes-fashion-volumizing-lengthening-mascara-11ml',
  volumeLabel: '۱۱ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  variantSkuSuffix: '11',
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

const BRAND: BrandSeedInput = {
  name: 'کمس',
  slug: 'kemes',
  description:
    'کمس (Kemes Cosmetics) برندی در حوزه‌ی محصولات آرایشی ارزان‌قیمت است که بر ریمل، خط چشم و محصولات آرایش چشم تمرکز دارد. محصولات این برند با بسته‌بندی رنگی و فرمول‌های قابل‌کنترل، گزینه‌ای مقرون‌به‌صرفه برای استفاده‌ی روزمره هستند.',
};

const SUB_BRAND: SubBrandSeedInput = {
  name: 'ریمل کمس Fashion',
  slug: 'kemes-fashion',
};

const TAGS: TagSeedSpec[] = [
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

export async function seed(ds: DataSource): Promise<void> {
  await seedSingleVolumeProduct(ds, {
    product: PRODUCT,
    categoryPath: CATEGORY_PATH,
    brand: BRAND,
    subBrand: SUB_BRAND,
    tags: TAGS,
  });
}

if (require.main === module) {
  runStandaloneSeed(PRODUCT.title, seed);
}