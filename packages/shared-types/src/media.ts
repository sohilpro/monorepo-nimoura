export enum MediaOwnerType {
  PRODUCT_THUMBNAIL = 'product_thumbnail',
  PRODUCT_GALLERY = 'product_gallery',
  PRODUCT_VARIANT = 'product_variant',
  BRAND_LOGO = 'brand_logo',
  COMMENT_IMAGE = 'comment_image',
  EXPLORE_VIDEO = 'explore_video',
  MAGAZINE_COVER = 'magazine_cover',
  MAGAZINE_CONTENT_IMAGE = 'magazine_content_image',
  ARTICLE_CONTENT = 'article_content',
  BANNER = 'banner',
  CATEGORY_IMAGE = 'category_image',
  CATEGORY_ICON = 'category_icon',
  TICKET_ATTACHMENT = 'ticket_attachment',
}

export const MediaOwnerTypeLabels: Record<MediaOwnerType, string> = {
  [MediaOwnerType.PRODUCT_THUMBNAIL]: 'تصویر شاخص محصول',
  [MediaOwnerType.PRODUCT_GALLERY]: 'گالری محصول',
  [MediaOwnerType.PRODUCT_VARIANT]: 'تنوع محصول',
  [MediaOwnerType.BRAND_LOGO]: 'لوگوی برند',
  [MediaOwnerType.COMMENT_IMAGE]: 'تصویر دیدگاه',
  [MediaOwnerType.EXPLORE_VIDEO]: 'ویدیوی اکسپلور',
  [MediaOwnerType.MAGAZINE_COVER]: 'کاور مقاله مجله',
  [MediaOwnerType.MAGAZINE_CONTENT_IMAGE]: 'تصویر محتوای مقاله',
  [MediaOwnerType.ARTICLE_CONTENT]: 'محتوای مقاله',
  [MediaOwnerType.BANNER]: 'بنر و اسلایدر',
  [MediaOwnerType.CATEGORY_IMAGE]: 'تصویر شاخص دسته‌بندی',
  [MediaOwnerType.CATEGORY_ICON]: 'آیکون دسته‌بندی',
  [MediaOwnerType.TICKET_ATTACHMENT]: 'ضمیمه تیکت',
};

export interface MediaItem {
  id: number;
  ownerType: MediaOwnerType;
  ownerId: string;
  order: number;
  originalName: string;
  fileName: string;
  ftpPath?: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  ownerType?: MediaOwnerType | string;
  ownerId?: string;
  isTemp?: boolean;
  mimeType?: string;
  sortBy?: 'id' | 'size' | 'createdAt' | 'order';
  sortOrder?: 'ASC' | 'DESC';
}

export interface MediaStats {
  totalCount: number;
  totalSize: number;
  tempCount: number;
  attachedCount: number;
  byOwnerType: Record<string, { count: number; size: number }>;
  byMimeCategory: {
    images: number;
    videos: number;
    documents: number;
    others: number;
  };
}

export interface UpdateMediaPayload {
  ownerType?: MediaOwnerType;
  ownerId?: string;
  originalName?: string;
  order?: number;
}

export interface ReassignOwnerPayload {
  publicUrls: string[];
  newOwnerType: MediaOwnerType;
  newOwnerId: string;
}

export interface BulkDeleteMediaPayload {
  ids: number[];
}
