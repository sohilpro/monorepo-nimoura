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
  introduce: `<p><strong>ریمل حجم‌دهنده اسنس مدل I Love Extreme Volume</strong> (معروف به اسنس مشکی)، اسطوره حجم‌دهی برند معتبر اسنس آلمان است. این محصول با برس فیبری بزرگ و پرزدار متراکم خود، برای کسانی خلق شده که به دنبال پرپشت شدن سریع و یکدست مژه‌ها با بافت طبیعی هستند.</p>

<h3>ویژگی‌های کلیدی ریمل اسنس مشکی</h3>
<ul>
  <li><strong>برس مویی بزرگ (Maxi Fiber Brush):</strong> مویک‌های فشرده و متراکم این برس مقدار مناسبی از مایع غلیظ ریمل را در خود جای داده و در هر بار کشیدن، پوششی حجیم و سرتاسری ایجاد می‌کنند.</li>
  <li><strong>پرپشت‌کننده فوری مژه‌های نازک:</strong> فرمولاسیون کرمی ویژه، فضای خالی بین مژه‌ها را کاملاً پوشش می‌دهد و خط مژه را پرتر نشان می‌دهد.</li>
  <li><strong>پیگمنت‌های معدنی مشکی تیره:</strong> جلوه‌ای مات و گیرا بدون ایجاد حالت براق یا غیرطبیعی روی چشم‌ها می‌آفریند.</li>
  <li><strong>فرمولاسیون ایمن و تست‌شده:</strong> مورد تایید متخصصین چشم‌پزشکی بوده و برای افراد دارای چشم‌های حساس مناسب است.</li>
</ul>

<p>اگر مژه‌های کم‌تراکم دارید و می‌خواهید بدون نیاز به فرمژه یا مژه مصنوعی، چشمانی بازتر و گیراتر داشته باشید، مدل مشکی اکستریم همراه همیشگی شما خواهد بود.</p>`,
  howToUse: `<p>جهت بهره‌مندی از حداکثر کارایی برس فیبری بزرگ اسنس مشکی، مراحل زیر را پیشنهاد می‌کنیم:</p>

<ol>
  <li><strong>تمیز بودن مژه‌ها:</strong> مطمئن شوید هیچ اثری از کرم‌پودر یا ریمل قبلی روی مژه‌ها باقی نمانده است.</li>
  <li><strong>تنظیم میزان مواد روی برس:</strong> برس را به شکل چرخشی خارج کرده و در صورتی که مایع زیادی روی نوک آن تجمع کرده، اضافه‌ی آن را بگیرید.</li>
  <li><strong>ریمل زدن از ریشه تا نوک:</strong> نگاه خود را کمی به پایین بدوزید، برس مویی را در بن مژه‌ها قرار دهید و با حرکات آرام و مواج به سمت انتهای مژه‌ها بالا بکشید.</li>
  <li><strong>تثبیت و ایجاد جلوه اکستریم:</strong> در صورت تمایل به حجم مضاعف، لایه دوم را قبل از خشک شدن لایه ابتدایی اضافه کنید تا مژه‌ها بدون دانه دانه شدن حداکثر حجم را به خود بگیرند.</li>
</ol>

<blockquote>
  <p><strong>نکته مصرف:</strong> پس از استفاده، مطمئن شوید صدای قفل شدن یا محکم بسته شدن درپوش را حس کرده‌اید تا بافت فیبری ریمل رطوبت خود را از دست ندهد.</p>
</blockquote>`,
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