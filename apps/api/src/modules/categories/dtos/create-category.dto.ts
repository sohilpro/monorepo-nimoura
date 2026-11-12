import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

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
}
