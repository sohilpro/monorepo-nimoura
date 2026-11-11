import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemVariantDto {
  @ApiPropertyOptional({ description: 'شناسه تنوع محصول', example: 55 })
  @IsNumber()
  @IsOptional()
  id?: number;
}

export class CartItemDto {
  @ApiProperty({ description: 'شناسه محصول', example: 22 })
  @IsNumber()
  productId!: number;

  @ApiProperty({ description: 'تعداد محصول', example: 6 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: 'قیمت اعلامی کلاینت', example: 600000 })
  @IsNumber()
  @IsOptional()
  clientPrice?: number;

  @ApiPropertyOptional({ description: 'شناسه تنوع محصول', example: 55 })
  @IsNumber()
  @IsOptional()
  variantId?: number | null;

  @ApiPropertyOptional({
    type: () => CartItemVariantDto,
    description: 'اطلاعات آبجکت تنوع',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CartItemVariantDto)
  variant?: CartItemVariantDto | null;
}
