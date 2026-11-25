/** نقش آیتم در ویترین دایرهای: مرکز یا حلقهٔ اطراف */
export type ShowcaseItemRole = 'center' | 'ring';

export type ShowcaseVariant = 'grid' | 'scroll' | 'circle' | 'radial' | 'hero-cards';

/**
 * یک آیتم ویترین: میتواند به دستهبندی موجودی اشاره کند یا کاملاً سفارشی باشد.
 * مقادیر سفارشی (name/image/badge/...) بر مقدار دستهبندی اولویت دارند.
 */
export interface ShowcaseConfigItem {
  id?: number | string;
  categoryId?: number | null;
  role: ShowcaseItemRole;
  sortOrder?: number;
  name?: string;
  slug?: string;
  image?: string | null;
  badge?: string | null;
  keywords?: string | null;
  link?: string | null;
  isActive?: boolean;
}

export interface ShowcaseConfig {
  id: number;
  key: string;
  name: string;
  title?: string | null;
  highlight?: string | null;
  subtitle?: string | null;
  badgeText?: string | null;
  allLink?: string | null;
  variant: ShowcaseVariant;
  limit: number;
  showHeader: boolean;
  isActive: boolean;
  sortOrder: number;
  centerItem?: ShowcaseConfigItem | null;
  items: ShowcaseConfigItem[];
  metadata?: Record<string, any> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateShowcaseConfigPayload {
  key: string;
  name: string;
  title?: string | null;
  highlight?: string | null;
  subtitle?: string | null;
  badgeText?: string | null;
  allLink?: string | null;
  variant?: ShowcaseVariant;
  limit?: number;
  showHeader?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  centerItem?: ShowcaseConfigItem | null;
  items?: ShowcaseConfigItem[];
  metadata?: Record<string, any> | null;
}

export interface UpdateShowcaseConfigPayload extends Partial<CreateShowcaseConfigPayload> {}

/** کلیدهای پیشنهادی که هنگام شروع بکند به صورت idempotent ساخته میشوند */
export interface ShowcaseConfigSuggestion {
  key: string;
  name: string;
  title: string;
  highlight: string;
  subtitle: string;
  badgeText: string;
  variant: ShowcaseVariant;
  limit: number;
}

export const SHOWCASE_CONFIG_SUGGESTIONS: readonly ShowcaseConfigSuggestion[] = [
  {
    key: 'home-grid',
    name: 'ویترین شبکهای صفحه اصلی',
    title: 'دستهبندیهای',
    highlight: 'برگزیده',
    subtitle: 'محصولات تخصصی زیبایی، مراقبت و سلامت پوست و مو',
    badgeText: 'خرید بر اساس دستهبندی',
    variant: 'grid',
    limit: 6,
  },
  {
    key: 'home-hero-cards',
    name: 'کارتهای ویژه صفحه اصلی',
    title: 'لاینهای ویژه',
    highlight: 'نیمورا',
    subtitle: 'دسترسی سریع به محبوبترین مجموعههای تخصصی آرایشی و درمانی',
    badgeText: 'کالکشن برگزیده',
    variant: 'hero-cards',
    limit: 3,
  },
  {
    key: 'home-circle',
    name: 'روتینهای محبوب (دایرهای)',
    title: 'روتینهای محبوب',
    highlight: 'زیبایی و سلامت',
    subtitle: 'محبوبترین لاینها برای مراقبت روزمره از پوست، مو و چهره',
    badgeText: 'پیشنهاد متخصصان',
    variant: 'radial',
    limit: 6,
  },
] as const;
