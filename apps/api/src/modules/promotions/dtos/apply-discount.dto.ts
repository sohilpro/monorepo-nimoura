import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyDiscountDto {
  @ApiProperty({
    type: String,
    description: 'کد تخفیف وارد شده توسط کاربر',
    example: 'SUMMER25',
  })
  @IsString()
  promoCode!: string;

  @ApiProperty({
    type: Number,
    description: 'مبلغ کل سبد خرید قبل از اعمال تخفیف',
    example: 350000,
  })
  @IsNumber()
  cartTotal!: number;
}
