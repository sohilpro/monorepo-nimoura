// src/modules/products/dtos/product-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttributeBriefResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string; // مثلاً: "وزن" یا "رنگ"
}

export class CategoryBriefResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @Type(() => CategoryBriefResponseDto)
  @ApiPropertyOptional({ type: () => CategoryBriefResponseDto })
  parent?: CategoryBriefResponseDto;
}

export class BrandBriefResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiPropertyOptional()
  logo?: string;

  @Expose()
  @ApiPropertyOptional()
  description?: string;
}

export class SubBrandBriefResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  brandId: number;
}

export class ProductImageResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  url: string;
}

export class ProductSpecificationResponseDto {
  @Expose()
  @ApiProperty()
  key: string;

  @Expose()
  @ApiProperty()
  value: string;
}

export class AttributeValueBriefResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  value: string; // مثلاً: "m1-8g" یا "قرمز"

  // ۱. استخراج خودکار نام ویژگی از رابطه attribute.name
  @Expose()
  @Transform(({ obj }) => obj.attribute?.name || obj.attributeName || null)
  @ApiPropertyOptional()
  attributeName?: string;

  // ۲. ارسال کل آبجکت attribute (اختیاری ولی استاندارد)
  @Expose()
  @Type(() => AttributeBriefResponseDto)
  @ApiPropertyOptional({ type: () => AttributeBriefResponseDto })
  attribute?: AttributeBriefResponseDto;
}

export class ProductVariantResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  sku: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  priceDiscount: number;

  @Expose()
  @ApiProperty()
  percentageDiscount: number;

  @Expose()
  @ApiProperty()
  stock: number;

  @Expose()
  @ApiProperty()
  isAvailable: boolean;

  @Expose()
  @ApiProperty({ type: [String] })
  images: string[];

  @Expose()
  @ApiPropertyOptional()
  image?: string;

  @Expose()
  @Type(() => AttributeValueBriefResponseDto)
  @ApiProperty({ type: () => [AttributeValueBriefResponseDto] })
  attributeValues: AttributeValueBriefResponseDto[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @Type(() => ProductPriceTierResponseDto)
  @ApiPropertyOptional({ type: () => [ProductPriceTierResponseDto] })
  priceTiers?: ProductPriceTierResponseDto[];
}

export class ProductPriceTierResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ description: 'حداقل تعداد' })
  minQuantity: number;

  @Expose()
  @ApiProperty({ description: 'قیمت هر عدد در این پله' })
  price: number;
}

export class ProductResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiPropertyOptional()
  englishTitle?: string;

  @Expose()
  @ApiProperty()
  sku: string;

  @Expose()
  @ApiProperty({ enum: ['simple', 'variant', 'bundle'] })
  type: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  priceDiscount: number;

  @Expose()
  @ApiProperty()
  percentageDiscount: number;

  @Expose()
  @ApiProperty()
  stock: number;

  @Expose()
  @ApiProperty()
  isAvailable: boolean;

  @Expose()
  @ApiProperty()
  isAmazingOffer: boolean;

  @Expose()
  @ApiPropertyOptional()
  thumbnail?: string;

  @Expose()
  @ApiPropertyOptional()
  shortDescription?: string;

  @Expose()
  @ApiPropertyOptional()
  introduce?: string;

  @Expose()
  @ApiPropertyOptional()
  howToUse?: string;

  @Expose()
  @ApiProperty()
  averageRating: number;

  @Expose()
  @ApiProperty()
  ratingsCount: number;

  @Expose()
  @Type(() => CategoryBriefResponseDto)
  @ApiPropertyOptional({ type: () => CategoryBriefResponseDto })
  category?: CategoryBriefResponseDto;

  @Expose()
  @Type(() => BrandBriefResponseDto)
  @ApiPropertyOptional({ type: () => BrandBriefResponseDto })
  brand?: BrandBriefResponseDto;

  @Expose()
  @Type(() => SubBrandBriefResponseDto)
  @ApiPropertyOptional({ type: () => SubBrandBriefResponseDto })
  subBrand?: SubBrandBriefResponseDto;

  @Expose()
  @Type(() => ProductSpecificationResponseDto)
  @ApiProperty({ type: () => [ProductSpecificationResponseDto] })
  specifications: ProductSpecificationResponseDto[];

  @Expose()
  @Type(() => ProductImageResponseDto)
  @ApiProperty({ type: () => [ProductImageResponseDto] })
  images: ProductImageResponseDto[];

  @Expose()
  @Type(() => ProductPriceTierResponseDto)
  @ApiPropertyOptional({ type: () => [ProductPriceTierResponseDto] })
  priceTiers?: ProductPriceTierResponseDto[];

  @Expose()
  @Type(() => ProductVariantResponseDto)
  @ApiProperty({ type: () => [ProductVariantResponseDto] })
  variants: ProductVariantResponseDto[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
