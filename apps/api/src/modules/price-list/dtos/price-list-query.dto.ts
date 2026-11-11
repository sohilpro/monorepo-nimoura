import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

export class PriceListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number; // زیرمجموعه‌ها هم شامل می‌شوند

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  onlyAvailable?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  onlyWholesale?: boolean; // فقط محصولاتی که قیمت عمده دارند
}
