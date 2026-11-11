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
  introduce: `اسپری ضد تعریق داو مدل Original یکی از پرفروش‌ترین محصولات خط ضد تعریق برند داو است که با فرمول اختصاصی «Moisturising Cream» خود شناخته می‌شود. این فرمول ترکیبی از مواد مرطوب‌کننده با عوامل ضد تعریق است؛ به همین دلیل در کنار توقف تعریق، پوست زیر بغل را در طول روز نرم نگه می‌دارد و از خشکی، کشیدگی و سوزش جلوگیری می‌کند.

محافظت این اسپری تا ۴۸ ساعت ادامه دارد. یعنی یک بار استفاده در صبح، برای پوستی که به‌طور معمول دچار تعریق متوسط است، تا پایان روز بعد کافی است. ترکیبات ضد تعریق آن با انسداد موقت مجاری غدد عرق، مقدار تعریق را کاهش می‌دهند؛ نه اینکه فقط بوی آن را بپوشانند.

این محصول بدون الکل فرموله شده است. برای پوست زیر بغل که یکی از حساس‌ترین نواحی بدن است و دائماً در معرض تراشیدن و اصطکاک قرار دارد، این نکته مهم است: فرمول‌های حاوی الکل می‌توانند پس از اصلاح باعث سوزش و التهاب شوند، در حالی که نسخه‌ی بدون الکل داو این مشکل را ندارد.

بوی آن، رایحه‌ی کلاسیک و شناخته‌شده‌ی Original داو است؛ بوی صابونی-گلی ملایم که پس از خشک شدن روی پوست، رایحه‌ای تمیز و ملایم باقی می‌گذارد و با اکثر عطرها تداخل نمی‌کند.`,
  howToUse: `۱. پیش از استفاده، پوست زیر بغل باید کاملاً تمیز و خشک باشد. رطوبت روی پوست، جذب فرمول را کاهش می‌دهد و ممکن است لکه‌ی سفید باقی بگذارد.

۲. قوطی را در فاصله‌ی حدود ۱۵ سانتی‌متری پوست نگه دارید.

۳. به مدت ۲ تا ۳ ثانیه روی هر زیر بغل اسپری کنید. اسپری کردن بیش از حد، فایده‌ای ندارد و فقط مصرف را بالا می‌برد.

۴. اجازه دهید چند ثانیه خشک شود و سپس لباس بپوشید.

۵. بهترین زمان استفاده، شب قبل از خواب است، زمانی که غدد عرق کمتر فعال هستند و ترکیب ضد تعریق زمان کافی برای نفوذ به مجاری عرق دارد.

۶. برای یک بار در روز استفاده شود؛ تجدید به‌طور معمول لازم نیست.

توجه: از استعمال روی پوست آسیب‌دیده، زخمی یا تازه اصلاح‌شده خودداری کنید. از تماس با چشم و استنشاق مستقیم پرهیز کنید. دور از دسترس کودکان و از حرارت بالای ۵۰ درجه نگه دارید.`,
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