// src/modules/brands/dtos/create-brand.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    example: 'لورآل',
    description: 'نام برند اصلی',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'https://cdn.site.com/uploads/brands/logo.webp',
    description: 'لینک لوگوی برند (دریافت شده از آپلودر)',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    example: 'توضیحات کوتاه درباره برند...',
    description: 'توضیحات برند',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['لورآل پاریس', 'لورآل من'],
    description: 'لیست ساب‌برندها',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subBrands?: string[]; // چون از کامپوننت TagInput مقدار رشته می‌فرستید، باید string[] باشد

  @ApiProperty({ description: 'اسلاگ برند (اختیاری)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;
}