import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ProductFilterQueryDto } from 'src/modules/products/dtos/product-query.dto';

// ⚠️ مسیر را مطابق پروژه‌ات درست کن (همان فایلی که PaginationQueryDto و ProductFilterQueryDto داخلش هستند)

/**
 * همه‌ی فیلترها و مرتب‌سازی‌ها از ProductFilterQueryDto ارث می‌رسد:
 *   page, limit, sort, sortOrder, minPrice, maxPrice, brandId, categoryId, subBrandId
 *
 * اگر sort فرستاده نشود، نتایج بر اساس «میزان ارتباط با عبارت جستجو» مرتب می‌شوند.
 * (عمداً مقدار «relevance» به sort اضافه نکردم؛ چون اعتبارسنجی IsIn کلاس پدر
 *  هم اجرا می‌شود و آن را رد می‌کرد.)
 */
export class SearchProductDto extends ProductFilterQueryDto {
  @ApiProperty({ description: 'عبارت جستجو' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'عبارت جستجو نمی‌تواند خالی باشد' })
  q!: string;

  // در ProductFilterQueryDto این فیلد نادیده گرفته می‌شد؛ در جستجو اعمال می‌شود.
  @ApiPropertyOptional({ description: 'فقط کالاهای موجود' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === true)
  @IsBoolean()
  declare isAvailable?: boolean;

  @ApiPropertyOptional({
    description:
      'آستانه‌ی شباهت (۰ تا ۱). هرچه کمتر، جستجو مدارا‌گرتر و نتایج بیشتر (و کم‌ربط‌تر)',
    default: 0.15,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  threshold?: number = 0.15;
}
