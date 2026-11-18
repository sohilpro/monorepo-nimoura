/**
 * Seeds the Dove Original Woman anti-perspirant spray (250 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-dove-original.ts
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
    'اسپری ضد تعریق داو مدل Original حجم ۲۵۰ میلی‌لیتر (Dove Original Woman Anti-Perspirant Spray)',
  englishTitle: 'Dove Original Woman Anti-Perspirant Spray 250 ml',
  sku: 'DOVE-AP-ORIG-250',
  slug: 'dove-original-woman-anti-perspirant-spray-250ml',
  volumeLabel: '۲۵۰ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  variantSkuSuffix: '250',
  price: 520_000,
  priceDiscount: 0,
  stock: 60,
  lowStockThreshold: 10,
  shortDescription:
    'اسپری ضد تعریق داو مدل Original با کرم مرطوب‌کننده‌ی فشرده، ۴۸ ساعت محافظت در برابر تعریق و بوی بد را فراهم می‌کند و پوست زیر بغل را نرم و خشک نگه می‌دارد. بدون الکل، حجم ۲۵۰ میلی‌لیتر.',
  introduce: `<p><strong>اسپری ضد تعریق داو مدل Original زنانه (Dove Original)</strong> یک همراه وفادار و مطمئن برای طراوت و بهداشت روزانه است. وجه تمایز بی‌رقیب این اسپری، حضور <strong>۱/۴ کرم مرطوب‌کننده داو</strong> در ترکیبات آن است که پوست ظریف و نازک زیر بغل را فوق‌العاده نرم، صاف و تغذیه می‌نماید و از خارش و تیرگی ناشی از خشکی پیشگیری می‌کند.</p>

<h3>مزایای شاخص اسپری داو اورجینال</h3>
<ul>
  <li><strong>محافظت قدرتمند ۴۸ ساعته:</strong> با مهار ترشح بیش از حد غدد تعریق و پیشگیری از رشد باکتری‌های مولد بوی نامطبوع، حس خشکی و تازگی را تا دو روز متوالی تضمین می‌کند.</li>
  <li><strong>فرمولاسیون فاقد الکل (0% Alcohol):</strong> احتمال بروز هرگونه سوزش، قرمزی و التهاب، به خصوص بلافاصله پس از اصلاح و شیو کردن را به صفر می‌رساند.</li>
  <li><strong>تسکین‌دهنده و نرم‌کننده پوست:</strong> حاوی روغن‌های محافظ و کرم مغذی برای ترمیم سد دفاعی پوست ناحیه زیر بغل.</li>
  <li><strong>رایحه ماندگار و دوست‌داشتنی:</strong> عطر کلاسیک و نمادین داو که بویی پاکیزه، پودری و ملایم شبیه به صابون‌های لوکس به همراه دارد و حس پاکیزگی بی‌پایانی به شما می‌بخشد.</li>
</ul>

<p>این محصول لکه‌ی سفید روی لباس‌های تیره یا لکه‌ی زرد روی لباس‌های روشن بر جای نمی‌گذارد و برای بانوانی با سبک زندگی پرتحرک یا پوست حساس، انتخابی بی‌نظیر است.</p>`,
  howToUse: `<p>جهت ماندگاری کامل ۴۸ ساعته و جلوگیری از تجمع پودری روی لباس:</p>

<ol>
  <li><strong>تکان دادن اسپری:</strong> قبل از هر بار مصرف، قوطی اسپری را به خوبی تکان دهید تا کرم مرطوب‌کننده و ذرات فعال ضد تعریق کاملاً ترکیب شوند.</li>
  <li><strong>آماده‌سازی پوست:</strong> حتماً بر روی پوست تمیز و کاملاً خشک اسپری کنید؛ استفاده روی پوست عرق‌کرده اثرگذاری را کاهش می‌دهد.</li>
  <li><strong>رعایت فاصله استاندارد:</strong> قوطی را در فاصله <strong>۱۵ سانتی‌متری</strong> از ناحیه زیر بغل نگه داشته و برای هر طرف به مدت <strong>۲ الی ۳ ثانیه</strong> اسپری نمایید.</li>
  <li><strong>خشک شدن پیش از پوشیدن لباس:</strong> چند ثانیه فرصت دهید تا غبار محصول جذب و خشک شود، سپس لباس خود را بپوشید.</li>
</ol>

<blockquote>
  <p><strong>هشدار مصرف:</strong> بر روی پوست زخمی، دارای خراشیدگی یا ملتهب استفاده نشود. قوطی تحت فشار است؛ از قرار دادن در معرض تابش مستقیم آفتاب یا حرارت بالای ۵۰ درجه سانتی‌گراد اکیداً خودداری فرمایید.</p>
</blockquote>`,
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

const BRAND: BrandSeedInput = {
  name: 'داو',
  slug: 'dove',
  description:
    'داو (Dove) یکی از شناخته‌شده‌ترین برندهای جهانی در حوزه‌ی مراقبت از پوست و بدن است که بر فرمول‌های ملایم، مرطوب‌کننده و بدون خشکی تمرکز دارد. خط ضد تعریق این برند با کرم مرطوب‌کننده‌ی مخصوص خود، استانداردی متمایز در این دسته ایجاد کرده است.',
};

const SUB_BRAND: SubBrandSeedInput = {
  name: 'داو Original',
  slug: 'dove-original',
};

const TAGS: TagSeedSpec[] = [
  { groupSlug: 'nature', name: 'اسپری ضد تعریق' },
  { groupSlug: 'nature', name: 'ضد تعریق و ضد عرق' },
  { groupSlug: 'skin-type', name: 'همه انواع پوست' },
  { groupSlug: 'skin-type', name: 'پوست حساس' },
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