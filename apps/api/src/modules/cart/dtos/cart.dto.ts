import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CartDto {
  @ApiProperty({
    type: Number,
    description: 'شناسه محصول',
    example: 101,
  })
  @Type(() => Number)
  @IsInt({ message: 'شناسه محصول باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه محصول باید بزرگتر از صفر باشد' })
  productId!: number;

  @ApiProperty({
    type: Number,
    description: 'تعداد محصول مورد نظر',
    example: 2,
  })
  @Type(() => Number)
  @IsInt({ message: 'تعداد باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'تعداد باید حداقل ۱ باشد' })
  quantity!: number;

  @ApiPropertyOptional({
    description: 'شناسه تنوع یا آبجکت کامل تنوع',
    example: 55,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // اگر آبجکت کامل بود، فقط فیلد id را بیرون بکش
    if (value && typeof value === 'object' && 'id' in value) {
      return Number(value.id);
    }
    // اگر مستقیماً عدد یا رشته عددی بود
    if (value !== null && value !== undefined && value !== '') {
      return Number(value);
    }
    return null;
  })
  @IsInt({ message: 'شناسه تنوع باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه تنوع باید بزرگتر از صفر باشد' })
  variant?: number | null;

  @ApiPropertyOptional({
    description: 'شناسه تنوع در صورت ارسال تکی',
    example: 55,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  variantId?: number;
}

export class RemoveCartItemDto {
  @ApiPropertyOptional({ description: 'شناسه تنوع یا آبجکت تنوع' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value && typeof value === 'object' && 'id' in value) {
      return Number(value.id);
    }
    if (value !== null && value !== undefined && value !== '') {
      return Number(value);
    }
    return null;
  })
  @IsInt()
  @IsPositive()
  variant?: number | null;

  @ApiPropertyOptional({ description: 'شناسه مستقیم تنوع' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  @IsPositive()
  variantId?: number;
}
