import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'وضعیت جدید سفارش',
    example: OrderStatus.SHIPPED,
  })
  @IsNotEmpty({ message: 'وضعیت سفارش نمی‌تواند خالی باشد' })
  @IsEnum(OrderStatus, { message: 'وضعیت سفارش نامعتبر است' })
  status!: OrderStatus;
}
