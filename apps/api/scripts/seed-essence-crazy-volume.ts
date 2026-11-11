/**
 * Seeds the Essence I Love Extreme Crazy Volume mascara (12 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-essence-crazy-volume.ts
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
    'ریمل حجم‌دهنده اسنس مدل I Love Extreme Crazy Volume حجم ۱۲ میلی‌لیتر',
  englishTitle: 'Essence I Love Extreme Crazy Volume Mascara',
  sku: 'ESS-ILX-CRAZY-12',
  slug: 'essence-i-love-extreme-crazy-volume-mascara-12ml',
  volumeLabel: '۱۲ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  variantSkuSuffix: '12',
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

const BRAND: BrandSeedInput = {
  name: 'اسنس',
  slug: 'essence',
  description:
    'اسنس (Essence) برند آلمانی محصولات آرایشی است که با قیمت مناسب و کیفیت قابل‌اتکا در بازار جهانی شناخته می‌شود. خط ریمل این برند، به‌ویژه سری I Love Extreme، از پرفروش‌ترین ریمل‌های ارزان‌قیمت دنیاست و بر حجم‌دهی قوی و پوشش پیگمنت‌دار تمرکز دارد.',
};

const SUB_BRAND: SubBrandSeedInput = {
  name: 'ریمل اسنس I Love Extreme',
  slug: 'essence-i-love-extreme',
};

const TAGS: TagSeedSpec[] = [
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