import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ShippingInfoDto } from './shipping-info.dto';
import { PaymentInfoDto } from './payment-info.dto';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../entities/orders.entity';

// مطابق ShippingInfo嵌‌شده‌ات، فیلدها را تنظیم کن
export class UpdateShippingInfoDto extends PartialType(ShippingInfoDto) {}

// مطابق PaymentInfo嵌‌شده‌ات، فیلدها را تنظیم کن
export class UpdatePaymentInfoDto extends PartialType(PaymentInfoDto) {}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  postalBarcode?: string;
}
