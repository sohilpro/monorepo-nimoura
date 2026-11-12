export const STOREFRONT_SORT_VALUES = [
  'popular',
  'newest',
  'cheapest',
  'expensive',
] as const;

export type StorefrontSort = (typeof STOREFRONT_SORT_VALUES)[number];

export const STOREFRONT_SORT_OPTIONS: ReadonlyArray<{
  label: string;
  value: StorefrontSort;
}> = [
  { label: 'محبوب‌ترین', value: 'popular' },
  { label: 'جدیدترین', value: 'newest' },
  { label: 'ارزان‌ترین', value: 'cheapest' },
  { label: 'گران‌ترین', value: 'expensive' },
];

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  logoUrl?: string;
  description?: string;
  subBrands?: SubBrand[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SubBrand {
  id: number;
  name: string;
  slug?: string;
  brandId?: number;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  logo?: string | null;
  description?: string;
  subBrands?: string[] | Array<{ name: string; slug?: string }>;
}

export interface UpdateBrandPayload extends Partial<CreateBrandPayload> {}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoText?: string | null;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
  productsCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CategoryTreeItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: CategoryTreeItem[];
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parentId?: number | null;
  seoTitle?: string;
  seoDescription?: string;
  seoText?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export interface ProductPriceTier {
  id?: number;
  minQuantity: number;
  price: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductTag {
  id: number;
  name: string;
  slug?: string;
  color?: string | null;
  groupId?: number;
  group?: { id: number; name: string; slug: string };
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductBadgeType =
  | 'out_of_stock'
  | 'low_stock'
  | 'discount'
  | 'amazing_offer'
  | 'new'
  | 'bundle';
export type ProductBadgeTone = 'danger' | 'warning' | 'success' | 'info' | 'neutral';

export interface ProductBadge {
  type: ProductBadgeType;
  label: string;
  tone: ProductBadgeTone;
  value?: number;
}

export type VariantKind = 'volume' | 'weight' | 'color';

export const VARIANT_KIND_ATTRIBUTE_NAMES: Record<VariantKind, string> = {
  volume: 'حجم',
  weight: 'وزن',
  color: 'رنگ',
};

export interface ProductAttributeValue {
  id?: number;
  value: string;
  colorHex?: string | null;
  attributeName?: string;
  attribute?: { id?: number; name: string; kind?: VariantKind | 'custom' };
}

export interface ProductVariant {
  id: number;
  title?: string;
  sku: string;
  price: number;
  priceDiscount?: number;
  discountPercent?: number;
  stock: number;
  isAvailable?: boolean;
  images?: string[];
  attributeValues?: ProductAttributeValue[];
  /** Display label, e.g. "500 ml" or "Rose Gold" (storefront responses). */
  alt?: string;
  /** Hex color for color variants, otherwise the label (storefront responses). */
  value?: string;
  colorHex?: string | null;
  kind?: VariantKind | 'custom' | null;
  priceTiers?: ProductPriceTier[];
}

export interface ProductBundleItem {
  id?: number;
  quantity: number;
  product: Pick<Product, 'id' | 'title' | 'thumbnail' | 'sku' | 'type' | 'price' | 'priceDiscount'>;
  variant?: ProductVariant | null;
}

export interface ProductImage {
  id: number;
  url: string;
  isMain?: boolean;
  order?: number;
}

export type ProductType = 'simple' | 'variant' | 'bundle';

export interface Product {
  id: number;
  title: string;
  englishTitle?: string;
  slug: string;
  shortDescription?: string;
  introduce?: string;
  howToUse?: string;
  sku: string;
  type?: ProductType;
  price: number;
  priceDiscount?: number;
  discountPercent?: number;
  stock: number;
  isAvailable: boolean;
  isAmazingOffer?: boolean;
  thumbnail?: string;
  averageRating: number;
  ratingsCount: number;
  categoryId?: number;
  category?: Category;
  brandId?: number;
  brand?: Brand;
  subBrandId?: number | null;
  subBrand?: SubBrand | null;
  specifications?: ProductSpecification[];
  tags?: ProductTag[];
  lowStockThreshold?: number;
  stockStatus?: StockStatus;
  badges?: ProductBadge[];
  variants?: ProductVariant[];
  bundleItems?: ProductBundleItem[];
  images?: ProductImage[];
  priceTiers?: ProductPriceTier[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminProductListItem {
  id: number;
  title: string;
  englishTitle?: string;
  slug: string;
  sku?: string;
  thumbnail?: string;
  price: number;
  priceDiscount?: number;
  stock: number;
  isAvailable: boolean;
  isAmazingOffer?: boolean;
  type?: ProductType;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  variantsCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface VariantAttributeValuePayload {
  attributeName: string;
  kind: VariantKind;
  value: string;
  colorHex?: string;
}

export interface CreateVariantPayload {
  id?: number;
  sku?: string;
  price: number;
  priceDiscount?: number;
  stock: number;
  isAvailable?: boolean;
  images?: string[];
  attributeValues: VariantAttributeValuePayload[];
}

export interface BundleItemPayload {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface CreateProductPayload {
  title: string;
  englishTitle?: string;
  introduce?: string;
  shortDescription?: string;
  howToUse?: string;
  sku: string;
  type: ProductType;
  price: number;
  priceDiscount?: number;
  stock: number;
  isAmazingOffer?: boolean;
  isAvailable?: boolean;
  categoryId: number;
  brandId: number;
  subBrandId?: number | null;
  thumbnail?: string | null;
  images?: string[];
  specifications?: ProductSpecification[];
  tagIds?: number[];
  lowStockThreshold?: number;
  variants?: CreateVariantPayload[];
  bundleItems?: BundleItemPayload[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  imagesToDelete?: Array<string | number>;
  removeOldThumbnail?: boolean;
}
