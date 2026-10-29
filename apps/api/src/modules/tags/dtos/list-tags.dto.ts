import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ALLOWED_TYPES } from '../constants/tags.constant';

export class ListTagsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_TYPES as any)
  type?: string;

  @IsOptional()
  @IsString()
  q?: string; // جستجو روی value

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1; // صفحه‌بندی اختیاری
}
