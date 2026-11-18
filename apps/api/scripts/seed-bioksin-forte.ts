/**
 * Seeds the Bioksin FORTE anti-hair-loss shampoo (300 ml).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating them.
 * Images are intentionally left empty — they are uploaded from the admin panel.
 *
 * Run from apps/api:
 *   npx ts-node -P tsconfig.typeorm.json -r tsconfig-paths/register scripts/seed-bioksin-forte.ts
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
  title: 'شامپو ضد ریزش مو بیوکسین مدل FORTE حجم ۳۰۰ میلی‌لیتر',
  englishTitle: 'Bioksin Forte Anti-Hair Loss Shampoo 300 ml',
  sku: 'BIO-FORTE-300',
  slug: 'bioksin-forte-anti-hair-loss-shampoo-300ml',
  volumeLabel: '۳۰۰ میلی‌لیتر',
  volumeAttributeName: 'حجم',
  variantSkuSuffix: '300',
  price: 780_000,
  priceDiscount: 0,
  stock: 40,
  lowStockThreshold: 8,
  shortDescription:
    'شامپو ضد ریزش مو بیوکسین مدل FORTE با فرمول گیاهی و بدون پارابن، ریزش موی فصلی و ارثی را کاهش می‌دهد، تارهای نازک را تقویت می‌کند و پوست سر را بدون خشکی پاک می‌سازد. حجم ۳۰۰ میلی‌لیتر.',
  introduce: `<p><strong>شامپو ضد ریزش مو بیوکسین مدل FORTE (Bioksin Forte)</strong> یک درمان تخصصی و بر پایه‌ی عصاره‌های طبیعی است که به‌طور ویژه برای مهار ریزش‌های شدید، مزمن، ارثی و فصلی مو فرموله شده است. این نسخه با برچسب <strong>FORTE</strong> دارای بالاترین غلظت از کمپلکس گیاهی اختصاصی بیوکسین بوده و با تغذیه عمقی ریشه، تارهای نازک را احیا می‌کند.</p>

<h3>خواص و ترکیبات دارویی و گیاهی</h3>
<ul>
  <li><strong>کمپلکس فعال گیاهی (Biocomplex B11):</strong> حاوی فلاونوئیدها، اسیدهای چرب غیراشباع، ویتامین‌های گروه B و مواد معدنی (روی، آهن، منیزیم) که مستقیماً به ریشه مو نفوذ کرده و چرخه رشد فعال مو (آناژن) را تقویت می‌کنند.</li>
  <li><strong>افزایش گردش خون مویرگی کف سر:</strong> خون‌رسانی و اکسیژن‌رسانی به فولیکول‌های ضعیف‌شده را تسهیل کرده و سبب ضخیم‌تر شدن ساقه موهای کرکی می‌شود.</li>
  <li><strong>فرمولاسیون پاک و ضدحساسیت:</strong> کاملاً فاقد پارابن، رنگ‌های مصنوعی، فتالات و ترکیبات شیمیایی خشن بوده و برای استفاده مستمر پوست سر حساس ایده‌آل است.</li>
  <li><strong>تثبیت سبوم و pH متعادل:</strong> چربی مازاد پوست سر را که از عوامل تشدید ریزش مو است کنترل نموده و لطافت ساقه را حفظ می‌کند.</li>
</ul>

<p>استفاده منظم از شامپو بیوکسین فورته ظرف چند هفته به شکل مشهودی ریزش هنگام شانه زدن و استحمام را کاهش داده و حس تراکم و پرپشتی را به موها بازمی‌گرداند.</p>`,
  howToUse: `<p>برای مشاهده حداکثر اثر درمانی و جذب کامل ترکیبات فعال بیوکسین فورته، طبق پروتکل زیر عمل کنید:</p>

<ol>
  <li><strong>خیس کردن کامل موها:</strong> موها و پوست سر را با آب ولرم (نه داغ) به طور کامل مرطوب کنید. آب داغ موجب تضعیف ریشه مو و خشکی پوست سر می‌شود.</li>
  <li><strong>ماساژ پوست سر:</strong> مقدار مناسبی از شامپو را کف دست ریخته و با نوک انگشتان (نه ناخن‌ها) به مدت <strong>۱ تا ۲ دقیقه</strong> به آرامی روی تمام نواحی پوست سر ماساژ دهید تا کف غنی تشکیل شود.</li>
  <li><strong>زمان انتظار ضروری (مکث دارویی):</strong> اجازه دهید کف شامپو به مدت <strong>۲ تا ۳ دقیقه</strong> روی سر باقی بماند تا ریزمغذی‌ها و کمپلکس B11 از طریق فولیکول‌ها جذب شوند.</li>
  <li><strong>آبکشی کامل:</strong> کف سر و ساقه‌ها را با آب ولرم فراوان بشویید تا هیچ اثری از شامپو بر روی پوست سر باقی نماند.</li>
  <li><strong>تکرار دوره‌ای:</strong> برای بهترین بازدهی، حداقل ۳ الی ۴ بار در هفته از این شامپو به صورت منظم استفاده کنید.</li>
</ol>

<blockquote>
  <p><strong>نکته مکمل:</strong> در دوره ریزش شدید مو، استفاده همزمان از سرم یا آمپول‌های ضدریزش موضعی بیوکسین اثرگذاری درمانی را به اوج می‌رساند.</p>
</blockquote>`,
  specifications: [
    { key: 'برند', value: 'بیوکسین (Bioksin)' },
    { key: 'مدل', value: 'FORTE' },
    { key: 'نوع محصول', value: 'شامپو ضد ریزش مو' },
    { key: 'حجم', value: '۳۰۰ میلی‌لیتر' },
    { key: 'نوع مو', value: 'همه انواع مو، مناسب موی مستعد ریزش' },
    { key: 'فرمول', value: 'گیاهی، بدون پارابن، بدون فتالات، بدون SLS' },
    { key: 'pH', value: 'متعادل، مناسب پوست سر حساس' },
    { key: 'کشور سازنده', value: 'ترکیه' },
    { key: 'شرایط نگهداری', value: 'دور از نور مستقیم و رطوبت، در دمای اتاق' },
    { key: 'تاریخ انقضا', value: '۲۴ ماه پس از تولید' },
  ],
};

/* ------------------------------------------------------------------ */
/* Taxonomy                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_PATH = ['مراقبت از مو', 'شامپو', 'شامپو ضد ریزش مو'];

const BRAND: BrandSeedInput = {
  name: 'بیوکسین',
  slug: 'bioksin',
  description:
    'بیوکسین (Bioksin) برند ترکیه‌ای فعال در حوزه‌ی مراقبت تخصصی از مو است که بر فرمول‌های گیاهی ضد ریزش، تقویت‌کننده و مراقبت از پوست سر تمرکز دارد. محصولات این برند بدون پارابن و با ترکیبات گیاهی فرموله می‌شوند.',
};

const SUB_BRAND: SubBrandSeedInput = {
  name: 'بیوکسین FORTE',
  slug: 'bioksin-forte',
};

const TAGS: TagSeedSpec[] = [
  { groupSlug: 'nature', name: 'شامپو' },
  { groupSlug: 'nature', name: 'شامپو ضد ریزش' },
  { groupSlug: 'hair-type', name: 'موی مستعد ریزش' },
  { groupSlug: 'hair-type', name: 'موی نازک و ضعیف' },
  { groupSlug: 'hair-type', name: 'همه انواع مو' },
  { groupSlug: 'benefit', name: 'کاهش ریزش مو' },
  { groupSlug: 'benefit', name: 'تقویت فولیکول مو' },
  { groupSlug: 'benefit', name: 'افزایش تراکم مو' },
  { groupSlug: 'benefit', name: 'پاک‌سازی پوست سر' },
  { groupSlug: 'concern', name: 'ریزش مو' },
  { groupSlug: 'concern', name: 'موی نازک' },
  { groupSlug: 'concern', name: 'پوست سر چرب' },
  { groupSlug: 'feature', name: 'بدون پارابن' },
  { groupSlug: 'feature', name: 'بدون SLS' },
  { groupSlug: 'feature', name: 'فرمول گیاهی' },
  { groupSlug: 'feature', name: 'بدون فتالات' },
  { groupSlug: 'season', name: 'چهار فصل' },
  { groupSlug: 'brand-line', name: 'بیوکسین' },
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