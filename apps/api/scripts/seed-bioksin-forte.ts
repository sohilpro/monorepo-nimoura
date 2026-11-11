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
  introduce: `شامپو ضد ریزش مو بیوکسین مدل FORTE یکی از شناخته‌شده‌ترین محصولات خط مراقبت از موی برند بیوکسین است که به‌طور اختصاصی برای موهای مستعد ریزش فرموله شده است. این نسخه با نام FORTE عرضه می‌شود و نسبت به نسخه‌های معمول، غلظت بالاتری از ترکیبات گیاهی مؤثر دارد.

فرمول آن بر پایه‌ی عصاره‌های گیاهی و کمپلکس ویتامین‌های گروه B ساخته شده است؛ ترکیبی که گردش خون در پوست سر را تحریک می‌کند، فولیکول‌های ضعیف را تغذیه می‌کند و چرخه‌ی رشد مو را طولانی‌تر نگه می‌دارد. نتیجه‌ی استفاده‌ی منظم، کاهش محسوس ریزش در هنگام شست‌وشو و شانه‌کردن و افزایش تراکم تارهای مو است.

این شامپو بدون سدیم لوریل سولفات خشک‌کننده، بدون پارابن و بدون فتالات فرموله شده و برای پوست سر حساس نیز مناسب است. pH متعادل آن مانع خشکی و خارش پوست سر می‌شود و در عین حال چربی اضافی و باقی‌مانده‌ی محصولات حالت‌دهنده را به‌خوبی پاک می‌کند.

حجم ۳۰۰ میلی‌لیتر آن برای حدود دو تا سه ماه استفاده‌ی منظم کافی است. برای بهترین نتیجه، استفاده‌ی همزمان با لوسیون یا سرم ضد ریزش همان برند توصیه می‌شود.`,
  howToUse: `۱. موها و پوست سر را با آب ولرم کاملاً خیس کنید.

۲. مقدار مناسبی از شامپو (به اندازه‌ی یک فندق برای موی کوتاه و دو برابر برای موی بلند) را در کف دست رقیق کنید.

۳. شامپو را روی پوست سر ماساژ دهید و با نوک انگشتان به مدت ۲ تا ۳ دقیقه دور بزنید تا کف کند.

۴. اجازه دهید ۲ دقیقه روی پوست سر بماند تا ترکیبات گیاهی جذب شوند.

۵. با آب ولرم کاملاً آبکشی کنید. در صورت نیاز مرحله را تکرار کنید.

۶. برای نتیجه‌ی بهتر، هفته‌ای ۳ تا ۴ بار استفاده کنید و بعد از شست‌وشو از نرم‌کننده یا سرم ضد ریزش استفاده کنید.

توجه: از تماس مستقیم با چشم خودداری کنید. در صورت تماس، با آب فراوان بشویید.`,
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