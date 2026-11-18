import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'لوازم آرایشی',
    description: 'نام دسته‌بندی',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'لوازم-آرایشی',
    description: 'slug یکتا برای استفاده در آدرس‌ها',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'شناسه دسته والد (در صورت وجود)',
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({
    example: 'خرید لوازم آرایشی اصل با بهترین قیمت | نیمورا',
    description: 'عنوان سئو (Meta Title)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({
    example: 'خرید آنلاین انواع لوازم آرایشی با ضمانت اصالت و ارسال سریع در نیمورا.',
    description: 'توضیحات متا (Meta Description)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'متن HTML توضیحات سئو در پایین صفحه دسته‌بندی (شامل H1/H2/H3 و پاراگراف)',
  })
  @IsOptional()
  @IsString()
  seoText?: string;

  @ApiPropertyOptional({
    example: 'https://vecaro.ir/uploads/categories/cosmetics.webp',
    description: 'تصویر شاخص دسته‌بندی برای شوکیس و کارت‌ها',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: 'https://vecaro.ir/uploads/categories/icons/lipstick.svg',
    description: 'آیکون دسته‌بندی برای منو و استوری',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    example: 'محبوب‌ترین',
    description: 'برچسب ویژه متنی برای شوکیس',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  badge?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'آیا در ویترین و شوکیس صفحه اصلی نمایش داده شود؟',
  })
  @IsOptional()
  @IsBoolean()
  showInShowcase?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'ترتیب نمایش در شوکیس',
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
