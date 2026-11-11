import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'لوازم آرایشی',
    description: 'نام دسته‌بندی',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'makeup',
    description: 'slug برای استفاده در آدرس‌ها',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: 1,
    description: 'شناسه دسته والد (در صورت وجود)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
