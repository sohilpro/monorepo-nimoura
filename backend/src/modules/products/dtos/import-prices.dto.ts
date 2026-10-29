import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PriceTierDto {
  @IsInt()
  @Min(1)
  minQuantity!: number;

  @IsInt()
  @Min(0)
  price!: number;
}

export class ImportPriceItemDto {
  @IsInt()
  row!: number;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  rowType?: 'simple' | 'variant';

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  /**
   * undefined = بدون تغییر در پله‌ها
   * [] (آرایه خالی) = حذف همه پله‌ها
   * آرایه پر = جایگزینی/همگام‌سازی پله‌ها
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  priceTiers?: PriceTierDto[];
}

export class ImportPricesDto {
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5000)
  @ValidateNested({ each: true })
  @Type(() => ImportPriceItemDto)
  items!: ImportPriceItemDto[];
}