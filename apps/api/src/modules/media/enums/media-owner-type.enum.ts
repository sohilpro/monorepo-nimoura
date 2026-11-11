/**
 * هر بخش سایت که عکس/ویدیو دارد یک مقدار اینجا می‌گیرد.
 * برای اضافه‌کردن بخش جدید (مثلاً بنر تبلیغاتی) فقط یک خط اینجا اضافه کنید،
 * نیازی به تغییر MediaService یا FtpService نیست.
 */
export enum MediaOwnerType {
  PRODUCT_THUMBNAIL = 'product_thumbnail',
  PRODUCT_GALLERY = 'product_gallery',
  PRODUCT_VARIANT = 'product_variant',
  BRAND_LOGO = 'brand_logo',
  COMMENT_IMAGE = 'comment_image',
  EXPLORE_VIDEO = 'explore_video',
  MAGAZINE_COVER = 'magazine_cover',
  MAGAZINE_CONTENT_IMAGE = 'magazine_content_image', // عکس‌های بین متن مقاله
  BANNER = 'banner', // بنرهای سایت
}

/**
 * هر ownerType به یک پوشه مشخص روی هاست مپ می‌شود.
 * مسیرها را مطابق ساختار ذخیره‌سازی خودتان تنظیم کنید.
 */
export const MEDIA_OWNER_TYPE_TO_FTP_DIR: Record<MediaOwnerType, string> = {
  [MediaOwnerType.PRODUCT_THUMBNAIL]: '/uploads/products/thumbnails',
  [MediaOwnerType.PRODUCT_GALLERY]: '/uploads/products/gallery',
  [MediaOwnerType.PRODUCT_VARIANT]: '/uploads/products/variants',
  [MediaOwnerType.BRAND_LOGO]: '/uploads/brands/logos',
  [MediaOwnerType.COMMENT_IMAGE]: '/uploads/comments',
  [MediaOwnerType.EXPLORE_VIDEO]: '/uploads/explore/videos',
  [MediaOwnerType.MAGAZINE_COVER]: '/uploads/magazine/covers',
  [MediaOwnerType.MAGAZINE_CONTENT_IMAGE]: '/uploads/magazine/content',
  [MediaOwnerType.BANNER]: '/uploads/banners',
};

/** محدودیت نوع فایل مجاز برای هر بخش (امنیت آپلود) */
export const MEDIA_OWNER_TYPE_ALLOWED_MIME: Record<MediaOwnerType, string[]> = {
  [MediaOwnerType.PRODUCT_THUMBNAIL]: ['image/jpeg', 'image/png', 'image/webp'],
  [MediaOwnerType.PRODUCT_GALLERY]: ['image/jpeg', 'image/png', 'image/webp'],
  [MediaOwnerType.PRODUCT_VARIANT]: ['image/jpeg', 'image/png', 'image/webp'],
  [MediaOwnerType.BRAND_LOGO]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ],
  [MediaOwnerType.COMMENT_IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
  [MediaOwnerType.EXPLORE_VIDEO]: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
  [MediaOwnerType.MAGAZINE_COVER]: ['image/jpeg', 'image/png', 'image/webp'],
  [MediaOwnerType.MAGAZINE_CONTENT_IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  [MediaOwnerType.BANNER]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ],
};

/** محدودیت حجم (بایت) برای هر بخش */
export const MEDIA_OWNER_TYPE_MAX_SIZE: Record<MediaOwnerType, number> = {
  [MediaOwnerType.PRODUCT_THUMBNAIL]: 5 * 1024 * 1024, // 5MB
  [MediaOwnerType.PRODUCT_GALLERY]: 8 * 1024 * 1024, // 8MB
  [MediaOwnerType.PRODUCT_VARIANT]: 6 * 1024 * 1024, // 6MB
  [MediaOwnerType.BRAND_LOGO]: 2 * 1024 * 1024, // 2MB
  [MediaOwnerType.COMMENT_IMAGE]: 4 * 1024 * 1024, // 4MB
  [MediaOwnerType.EXPLORE_VIDEO]: 200 * 1024 * 1024, // 200MB
  [MediaOwnerType.MAGAZINE_COVER]: 6 * 1024 * 1024, // 6MB
  [MediaOwnerType.MAGAZINE_CONTENT_IMAGE]: 6 * 1024 * 1024, // 6MB
  [MediaOwnerType.BANNER]: 10 * 1024 * 1024, // 10MB (حجم مناسب برای بنرهای عریض و باکیفیت)
};

/**
 * آیا این بخش باید از ImageOptimizerService رد بشه؟ ویدیو مسلماً نه.
 * لوگوی برند هم چون معمولاً svg/png شفاف با کیفیت اصلی لازمه، آپشنالش می‌ذاریم true
 * ولی خود optimizer برای svg دست نمی‌زنه (عبور می‌ده) و برای png/jpg بهینه می‌کنه.
 */
export const MEDIA_OWNER_TYPE_OPTIMIZABLE: Record<MediaOwnerType, boolean> = {
  [MediaOwnerType.PRODUCT_THUMBNAIL]: true,
  [MediaOwnerType.PRODUCT_GALLERY]: true,
  [MediaOwnerType.PRODUCT_VARIANT]: true,
  [MediaOwnerType.BRAND_LOGO]: true,
  [MediaOwnerType.COMMENT_IMAGE]: true,
  [MediaOwnerType.EXPLORE_VIDEO]: false, // Sharp روی ویدیو کار نمی‌کند
  [MediaOwnerType.MAGAZINE_COVER]: true,
  [MediaOwnerType.MAGAZINE_CONTENT_IMAGE]: true,
  [MediaOwnerType.BANNER]: true,
};

/**
 * سایز/کیفیت مخصوص هر بخش - عمداً برای بخش‌های کوچیک (کامنت، تامبنیل) عدد رو
 * پایین‌تر گرفتیم تا هم فایل سبک‌تر بشه هم فشار CPU روی sharp کمتر باشه.
 */
export const MEDIA_OWNER_TYPE_OPTIMIZE_OPTIONS: Record<
  MediaOwnerType,
  { maxWidth: number; maxHeight: number; quality: number }
> = {
  [MediaOwnerType.PRODUCT_THUMBNAIL]: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 80,
  },
  [MediaOwnerType.PRODUCT_VARIANT]: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 82,
  },
  [MediaOwnerType.PRODUCT_GALLERY]: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 82,
  },
  [MediaOwnerType.BRAND_LOGO]: { maxWidth: 600, maxHeight: 600, quality: 90 },
  [MediaOwnerType.COMMENT_IMAGE]: {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 75,
  },
  [MediaOwnerType.EXPLORE_VIDEO]: { maxWidth: 0, maxHeight: 0, quality: 0 },
  [MediaOwnerType.MAGAZINE_COVER]: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 82,
  },
  [MediaOwnerType.MAGAZINE_CONTENT_IMAGE]: {
    maxWidth: 1400,
    maxHeight: 1400,
    quality: 78,
  },
  [MediaOwnerType.BANNER]: { maxWidth: 2000, maxHeight: 1200, quality: 85 }, // متناسب با نمایشگرهای عریض دسکتاپ
};
