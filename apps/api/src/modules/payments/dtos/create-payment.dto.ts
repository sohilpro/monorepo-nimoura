import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    example: 1024,
    description: 'شناسه سفارش که باید پرداخت شود',
  })
  @IsInt()
  @Type(() => Number)
  orderId!: number;

  @ApiProperty({
    example: 150000,
    description: 'مبلغ به ریال (مثلاً ۱۵۰ هزار تومان = ۱۵۰۰۰۰)',
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  amount!: number;
}
