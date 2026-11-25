import { BannerDevice, BannerStatus, LinkTarget } from './enums.js';

/**
 * تنها منبع تعریف جایگاههای بنر در تمام پروژه (بکند / ادمین / فروشگاه).
 * بکند این لیست را هنگام شروع به صورت idempotent در دیتابیس ایجاد میکند،
 * ادمین و فرانت دقیقاً همان کلیدها را استفاده میکنند.
 */
export interface BannerPositionSuggestion {
  key: string;
  name: string;
  description?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  maxItems?: number;
}

export const BANNER_POSITIONS: readonly BannerPositionSuggestion[] = [
  {
    key: 'hero-home',
    name: 'اسلایدر اصلی صفحه اصلی',
    description: 'بنر بزرگ بالای صفحه اصلی (اسلایدر)',
    recommendedWidth: 1920,
    recommendedHeight: 640,
  },
  {
    key: 'home-middle-banners',
    name: 'بنرهای میانی صفحه اصلی',
    description: 'دو بنر کنار هم در میانه صفحه اصلی',
    recommendedWidth: 800,
    recommendedHeight: 400,
  },
  {
    key: 'home-bottom-banners',
    name: 'بنرهای پایین صفحه اصلی',
    description: 'چهار بنر پایین صفحه اصلی',
    recommendedWidth: 600,
    recommendedHeight: 400,
  },
  {
    key: 'category-top',
    name: 'بالای صفحه دستهبندی',
    description: 'بنر تمامعرض بالای لیست محصولات هر دسته',
    recommendedWidth: 1600,
    recommendedHeight: 400,
  },
  {
    key: 'products-top',
    name: 'بالای صفحه همه محصولات',
    description: 'بنر تمامعرض بالای لیست تمام محصولات (/products)',
    recommendedWidth: 1600,
    recommendedHeight: 400,
  },
  {
    key: 'product-bottom',
    name: 'پایین صفحه محصول',
    description: 'بنر تمامعرض بعد از توضیحات محصول',
    recommendedWidth: 1200,
    recommendedHeight: 300,
  },
  {
    key: 'magazine-top',
    name: 'بالای صفحه مجله',
    description: 'بنر تمامعرض بالای مقالات مجله',
    recommendedWidth: 1600,
    recommendedHeight: 400,
  },
] as const;

export type BannerPositionKey = (typeof BANNER_POSITIONS)[number]['key'];

export const BANNER_POSITION_KEYS: readonly string[] = BANNER_POSITIONS.map(
  (position) => position.key,
);

export interface BannerPosition {
  id: number;
  key: string;
  name: string;
  description?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  maxItems?: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  linkTarget?: LinkTarget;
  positionId: number;
  position?: BannerPosition;
  device: BannerDevice;
  status: BannerStatus;
  sortOrder: number;
  startAt?: string | Date;
  endAt?: string | Date;
  views?: number;
  clicks?: number;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateBannerPayload {
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  linkTarget?: LinkTarget;
  positionId: number;
  device?: BannerDevice;
  status?: BannerStatus;
  sortOrder?: number;
  startAt?: string;
  endAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateBannerPayload extends Partial<CreateBannerPayload> {}

export interface CreateBannerPositionPayload {
  key: string;
  name: string;
  description?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  maxItems?: number;
  isActive?: boolean;
}

export interface UpdateBannerPositionPayload
  extends Partial<CreateBannerPositionPayload> {}
