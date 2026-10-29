import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { MediaOwnerType } from '../enums/media-owner-type.enum';

export class MediaQueryDto {
  @ApiPropertyOptional({
    description: 'شماره صفحه برای صفحه‌بندی',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'تعداد آیتم در هر صفحه (حداکثر ۱۰۰)',
    default: 20,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'جستجو در نام اصلی یا نام ذخیره شده فایل',
    example: 'logo',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'فیلتر بر اساس نوع مالک مدیا',
    enum: MediaOwnerType,
    enumName: 'MediaOwnerType',
  })
  @IsOptional()
  @IsEnum(MediaOwnerType)
  ownerType?: MediaOwnerType;

  @ApiPropertyOptional({
    description: 'شناسه مالک مدیا (مثلاً شناسه برند یا محصول)',
    example: '12',
    type: String,
  })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({
    description:
      'فیلتر فایل‌های موقت (true برای فایل‌های temp، false برای متصل‌شده‌ها)',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isTemp?: boolean;

  @ApiPropertyOptional({
    description: 'فیلتر بر اساس فرمت (MIME Type)',
    example: 'image/webp',
    type: String,
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'مرتب‌سازی بر اساس ستون',
    enum: ['id', 'size', 'createdAt', 'order'],
    default: 'id',
  })
  @IsOptional()
  @IsIn(['id', 'size', 'createdAt', 'order'])
  sortBy?: 'id' | 'size' | 'createdAt' | 'order' = 'id';

  @ApiPropertyOptional({
    description: 'جهت مرتب‌سازی',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
