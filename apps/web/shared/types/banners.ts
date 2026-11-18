export type BannerDevice = 'all' | 'desktop' | 'mobile' | 'tablet'

export type BannerLayout =
  | 'carousel' // اسلایدر (هدر)
  | 'single' // یک بنر تمام‌عرض
  | 'grid-2' // دوتایی کنار هم
  | 'grid-3' // سه‌تایی
  | 'grid-4' // چهارتایی (موبایل ۲×۲، دسکتاپ ۴ ستون، بیشتر از ۴ → زیر هم)
  | 'featured' // ۱ بنر بزرگ + ۲ بنر کوچک
  | 'mosaic' // ۱ بنر بزرگ + ۴ بنر کوچک

/** شکل نرمال‌شده‌ای که به فرانت می‌رسد (فقط فیلدهای لازم؛ بدون views/clicks و ...) */
export interface BannerItem {
  id: number
  title: string
  alt: string
  image: string
  mobileImage?: string
  link?: string
  target: '_self' | '_blank'
}