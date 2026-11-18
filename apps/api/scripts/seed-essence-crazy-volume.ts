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
  introduce: `<p><strong>ریمل حجم‌دهنده اسنس مدل I Love Extreme Crazy Volume</strong> (معروف به اسنس صورتی)، از محبوب‌ترین و پرفروش‌ترین ریمل‌های حجم‌دهنده در سراسر جهان است. این محصول به‌طور اختصاصی برای افرادی فرموله شده است که مژه‌هایی کم‌پشت و نازک دارند و خواهان حجم حداکثری و نمایی بسیار پرپشت و درشت برای چشمان خود هستند.</p>

<h3>چرا این مدل «Crazy Volume» نامیده می‌شود؟</h3>
<ul>
  <li><strong>برس سیلیکونی انعطاف‌پذیر با دانه‌های مخروطی:</strong> طراحی هوشمندانه دندانه‌های برس به گونه‌ای است که تمام مژه‌ها، حتی کوتاه‌ترین تارهای گوشه چشم را در بر می‌گیرد و مانع از به هم چسبیدن آن‌ها می‌شود.</li>
  <li><strong>حجم‌دهی فوق‌العاده و چشمگیر:</strong> با اولین حرکت برس روی مژه‌ها، فرمول کرمی و غنی تارهای مژه را ضخیم کرده و اثری شبیه به مژه مصنوعی بر جای می‌گذارد.</li>
  <li><strong>رنگدانه‌های فوق‌العاده مشکی (Deep Black):</strong> پیگمنت‌های غنی کربنی باعث عمق بخشیدن به نگاه و پررنگ‌تر دیده‌شدن خط رویش مژه‌ها می‌شوند.</li>
  <li><strong>ماندگاری طولانی بدون ریزش:</strong> در طول روز زیر چشم سیاه نمی‌شود و خرد شدگی یا لکه‌ای بر جای نمی‌گذارد.</li>
</ul>

<p>این ریمل برای انواع آرایش‌های غلیظ، شبانه و حتی استفاده روزمره برای علاقه‌مندان به مژه‌های بلند و پرپشت انتخابی ایده‌آل و مقرون‌به‌صرفه است.</p>`,
  howToUse: `<p>برای دریافت بیشترین حجم بدون تجمع مایع ریمل روی مژه‌ها، به شیوه‌ی زیر عمل کنید:</p>

<ol>
  <li><strong>برداشتن اصولی محصول:</strong> برس را به‌آرامی و با حرکتی چرخشی از مخزن خارج کنید. از حرکت رفت‌وبرگشتی سریع (پمپ کردن) خودداری نمایید تا هوا وارد پوکه نشود و ریمل خشک نگردد. مایع اضافی نوک برس را به لبه داخلی پوکه بمالید.</li>
  <li><strong>اپلای از بن مژه:</strong> برس را دقیقاً در ریشه مژه‌ها قرار داده و با حرکت زیگزاگی (حرکت دست به چپ و راست) به سمت نوک مژه‌ها هدایت کنید تا تمام تارها از ریشه ضخیم شوند.</li>
  <li><strong>لایه‌گذاری حرفه‌ای:</strong> برای حجم خیره‌کننده، بلافاصله و قبل از خشک شدن کامل لایه اول، لایه دوم را بکشید. از زدن بیش از دو لایه خودداری کنید تا حالت مژه‌ها سنگین نشود.</li>
  <li><strong>مژه‌های پایینی:</strong> برس را به صورت عمودی نگه داشته و با نوک مخروطی آن تارهای مژه پلک پایین را به آرامی لمس کنید.</li>
</ol>

<blockquote>
  <p><strong>روش شست‌وشو:</strong> این ریمل به راحتی با میسلار واتر دوفاز مخصوص چشم یا شوینده ملایم شسته می‌شود. از کشیدن محکم پد روی چشم خودداری کنید تا آسیبی به ریشه مژه‌ها نرسد.</p>
</blockquote>`,
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