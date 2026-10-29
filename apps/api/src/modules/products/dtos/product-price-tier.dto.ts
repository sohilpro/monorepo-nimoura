// dtos/product-price-tier.dto.ts
import { IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PriceTierDto {
  @ApiProperty({ description: 'حداقل تعداد برای فعال‌شدن این قیمت', example: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(2, { message: 'حداقل تعداد برای پلکان عمده باید ۲ عدد یا بیشتر باشد' })
  minQuantity!: number;

  @ApiProperty({ description: 'قیمت هر عدد در این پله', example: 85000 })
  @Type(() => Number)
  @IsInt()
  @IsPositive({ message: 'قیمت پله باید بزرگتر از صفر باشد' })
  price!: number;
}