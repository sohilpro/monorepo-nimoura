import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from 'src/modules/orders/dtos/payment-info.dto';

export class PaymentSuccessDto {
  @IsNotEmpty()
  @IsString()
  refId!: string;

  @IsOptional() // 👈 تغییر ۱: اجباری نیست
  @IsEnum(PaymentMethod)
  method?: PaymentMethod; // 👈 تغییر ۲: علامت سوال
}

export class PaymentFailureDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
