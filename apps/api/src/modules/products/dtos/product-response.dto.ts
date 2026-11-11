// src/modules/products/dtos/product-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { buildProductBadges, getStockStatus } from '../utils/product-badges';

/** The color value when the variant has one, otherwise the first attribute value. */
function primaryAttributeValue(variant: any): any {
  const values: any[] = variant?.attributeValues ?? [];
  return values.find((a) => a?.attribute?.kind === 'color') ?? values[0];
}

export class ProductBadgeResponseDto {
  @Expose() type: string;
  @Expose() label: string;
  @Expose() tone: string;
  @Expose() value?: number;
}

export class ProductTagGroupResponseDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() slug: string;
}

export class ProductTagResponseDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() slug: string;
  @Expose() color?: string | null;
  @Expose()
  @Type(() => ProductTagGroupResponseDto)
  group?: ProductTagGroupResponseDto;
}

export class AttributeBriefResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string; // مثلاً: "وزن" یا "رنگ"

  @Expose()
  @ApiProperty({ enum: ['volume', 'weight', 'color', 'custom'] })
  kind: string;
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

  @Expose()
  @ApiPropertyOptional({ description: 'کد رنگ #RRGGBB (فقط تنوع رنگی)' })
  colorHex?: string | null;

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
  @Transform(({ obj }) => primaryAttributeValue(obj)?.attribute?.kind ?? null)
  @ApiPropertyOptional({ enum: ['volume', 'weight', 'color', 'custom'] })
  kind?: string | null;

  @Expose()
  @Transform(({ obj }) => primaryAttributeValue(obj)?.colorHex ?? null)
  @ApiPropertyOptional()
  colorHex?: string | null;

  /** رنگ (در تنوع رنگی) یا همان برچسب نمایشی؛ برای سازگاری با ویترین */
  @Expose()
  @Transform(({ obj }) => {
    const attr = primaryAttributeValue(obj);
    return attr?.colorHex ?? attr?.value ?? null;
  })
  @ApiPropertyOptional()
  value?: string | null;

  /** برچسب نمایشی تنوع، مثل «۵۰۰ میلی‌لیتر» یا «رزگلد» */
  @Expose()
  @Transform(({ obj }) =>
    (obj.attributeValues ?? []).map((a: any) => a.value).join(' / '),
  )
  @ApiProperty()
  alt: string;

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
  lowStockThreshold?: number;

  /** Computed here when the service did not already add it (e.g. detail endpoints). */
  @Expose()
  @Transform(({ obj }) => obj.stockStatus ?? getStockStatus(obj))
  @ApiProperty({ enum: ['in_stock', 'low_stock', 'out_of_stock'] })
  stockStatus: string;

  @Expose()
  @Transform(({ obj }) => obj.badges ?? buildProductBadges(obj))
  @ApiProperty({ type: () => [ProductBadgeResponseDto] })
  badges: ProductBadgeResponseDto[];

  /** Only active tags of active groups are public. */
  @Expose()
  @Transform(({ obj }) =>
    (obj.tags ?? [])
      .filter((t: any) => t.isActive !== false && t.group?.isActive !== false)
      .map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color ?? null,
        group: t.group
          ? { id: t.group.id, name: t.group.name, slug: t.group.slug }
          : undefined,
      })),
  )
  @ApiPropertyOptional({ type: () => [ProductTagResponseDto] })
  tags?: ProductTagResponseDto[];

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
