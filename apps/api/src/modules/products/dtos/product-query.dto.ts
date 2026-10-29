import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const SORTABLE_COLUMNS = [
  'newest',
  'cheapest',
  'expensive',
  'popular',
  'title',
  'stock',
  'createdAt',
] as const;

export type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export const SORT_ORDERS = ['ASC', 'DESC'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'حداکثر مقدار limit برابر 100 است' })
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'جستجو در عنوان و توضیحات' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'مرتب‌سازی',
    enum: SORTABLE_COLUMNS,
    default: 'newest',
  })
  @IsOptional()
  @IsIn(SORTABLE_COLUMNS, {
    message: `sort باید یکی از مقادیر [${SORTABLE_COLUMNS.join(', ')}] باشد`,
  })
  sort?: SortableColumn;

  @ApiPropertyOptional({
    description: 'جهت مرتب‌سازی',
    enum: SORT_ORDERS,
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    description: 'وضعیت موجودی (در این اندپوینت نادیده گرفته می‌شود)',
  })
  @IsOptional()
  isAvailable?: any;

  @ApiPropertyOptional({ description: 'حداقل قیمت (تومان/ریال)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'حداکثر قیمت (تومان/ریال)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;
}

export class ProductFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'فیلتر بر اساس برند' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ description: 'فیلتر بر اساس دسته‌بندی' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'فیلتر بر اساس زیربرند (ساب‌برند)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subBrandId?: number;
}
