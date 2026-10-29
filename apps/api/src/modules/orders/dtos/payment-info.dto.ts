import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

// برای سازگاری با importهای قبلی از همین مسیر هم در دسترس است
export { PaymentMethod };

export class PaymentInfoDto {
  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'روش پرداخت (پیش‌فرض: زرین‌پال)',
    default: PaymentMethod.ZARINPAL,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  /** @deprecated توسط سرور تعیین می‌شود و مقدار ارسالی نادیده گرفته می‌شود */
  @ApiPropertyOptional({ deprecated: true, description: 'نادیده گرفته می‌شود' })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  /** @deprecated توسط سرور تعیین می‌شود و مقدار ارسالی نادیده گرفته می‌شود */
  @ApiPropertyOptional({ deprecated: true, description: 'نادیده گرفته می‌شود' })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  /** @deprecated توسط سرور تعیین می‌شود و مقدار ارسالی نادیده گرفته می‌شود */
  @ApiPropertyOptional({ deprecated: true, description: 'نادیده گرفته می‌شود' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}