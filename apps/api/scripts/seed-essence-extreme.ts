/**
 * Seeds the Essence I Love Extreme volume mascara (12 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-essence-extreme.ts
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
    'ریمل حجم‌دهنده اسنس مدل I Love Extreme Volume حجم ۱۲ میلی‌لیتر',
  englishTitle: 'Essence I Love Extreme Mascara',
  sku: 'ESS-ILX-VOL-12',
  slug: 'essence-i-love-extreme-volume-mascara-12ml',
  volumeLabel: '۱۲ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  variantSkuSuffix: '12',
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
  { groupSlug: 'concern', name: 'مژه کم‌پشت' },
  { groupSlug: 'concern', name: 'مژه نازک و کوتاه' },
  { groupSlug: 'feature', name: 'برس حجیم' },
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