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
  introduce: `<p><strong>ریمل حجم‌دهنده و بلندکننده کمس مدل Fashion</strong> یک ریمل دوکاره فوق‌العاده کاربردی است که هم‌زمان دو نیاز اساسی آرایش چشم را برطرف می‌سازد: <em>افزایش چشمگیر طول مژه‌ها</em> و <em>پرپشت ساختن تارهای مژه از ریشه</em>. این محصول با فرمول سبک خود، بدون ایجاد حس خستگی روی پلک، گزینه‌ای بی‌نقص برای مصارف روزمره و طولانی‌مدت است.</p>

<h3>مزایای منحصر‌به‌فرد ریمل فشن کمس</h3>
<ul>
  <li><strong>عملکرد دوگانه (Volumizing &amp; Lengthening):</strong> این فرمول تارهای کوتاه مژه را کشیده و بلندتر نشان داده و در عین حال ضخامت پایه مژه را دوچندان می‌کند.</li>
  <li><strong>برس مخروطی با دانه‌های دقیق:</strong> باریک بودن نوک برس دسترسی به ریزترین مژه‌های گوشه داخلی چشم و مژه‌های پلک پایین را بسیار آسان می‌سازد.</li>
  <li><strong>مقاومت بالا در برابر تعریق و رطوبت:</strong> این ریمل در آب و هوای شرجی، روزهای گرم یا هنگام فعالیت دچار ریزش، سیاهی و لکه زیر چشم نمی‌شود.</li>
  <li><strong>بافت کرمی بدون گلوله شدن:</strong> مواد ریمل به صورت کاملاً یکنواخت و یکدست بر روی تارها قرار گرفته و مانع از گره‌خوردن مژه‌ها می‌گردد.</li>
</ul>

<p>رنگ مشکی خالص این ریمل، نگاهی نافذ و شاداب به چهره می‌بخشد و انتخابی اقتصادی با کیفیتی بسیار رضایت‌بخش است.</p>`,
  howToUse: `<p>برای دریافت بهترین نتیجه از خاصیت بلندکنندگی و حجم‌دهندگی ریمل کمس فشن:</p>

<ol>
  <li><strong>استفاده از نوک برس برای مژه‌های گوشه:</strong> مژه‌های کوتاه گوشه داخلی چشم را با نوک باریک برس شانه بزنید تا تفکیک و بلند شوند.</li>
  <li><strong>حرکت پیوسته برای لیفت مژه:</strong> قسمت میانی و پهن‌تر برس را در ریشه مژه‌ها قرار دهید و با فشاری ملایم و حرکت رو به بالا، مژه‌ها را به سمت ابرو لیفت کنید.</li>
  <li><strong>لایه‌گذاری بدون چسبندگی:</strong> چند ثانیه بعد از لایه اول، لایه دوم را تنها بر روی نیمه بالایی مژه‌ها بکشید تا طول مژه‌ها افزایش پیدا کند بدون آنکه وزن اضافه ایجاد شود.</li>
</ol>

<blockquote>
  <p><strong>توصیه پاک‌سازی:</strong> برای پاک کردن آرایش چشم، از پد پنبه‌ای آغشته به پاک‌کننده دوفاز یا آب گرم به همراه شوینده صورت استفاده کنید و به آرامی در جهت رویش مژه‌ها بکشید.</p>
</blockquote>`,
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