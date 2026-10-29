export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  subBrands?: SubBrand[];
}

export interface SubBrand {
  id: number;
  name: string;
  slug?: string;
  brandId?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
}

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
  id?: number;
  name: string;
  type?: string;
}

export interface ProductVariant {
  id: number;
  title?: string;
  sku: string;
  price: number;
  priceDiscount?: number;
  stock: number;
  colorName?: string;
  colorHex?: string;
  value?: string;
  alt?: string;
  isAvailable?: boolean;
  priceTiers?: ProductPriceTier[];
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
  variants?: ProductVariant[];
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
  tags?: Array<{ name: string; type?: string }>;
  variants?: Array<{
    value?: string;
    colorName?: string;
    colorHex?: string;
    price?: number;
    priceDiscount?: number;
    stock: number;
    sku?: string;
    alt?: string;
  }>;
  priceTiers?: ProductPriceTier[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  imagesToDelete?: Array<string | number>;
  removeOldThumbnail?: boolean;
}
