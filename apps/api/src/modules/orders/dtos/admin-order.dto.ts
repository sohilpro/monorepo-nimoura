import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

/* ───────────── آیتم سفارش ───────────── */
export class AdminOrderItemDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiPropertyOptional({ example: 5, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  variantId?: number | null;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description:
      'قیمت واحد (تومان). اگر ارسال نشود: برای آیتم موجود قیمت قبلی حفظ می‌شود و برای آیتم جدید قیمت فعلی محصول/واریانت.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;
}

/* ───────────── آدرس ───────────── */
export class AdminAddressDto {
  @ApiPropertyOptional({ example: 'منزل' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ example: '1234567890' })
  @Matches(/^\d{10}$/, { message: 'کد پستی باید ۱۰ رقم باشد' })
  postal_code!: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'خیابان ...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;
}
export class UpdateAdminAddressDto extends PartialType(AdminAddressDto) {}

/* ───────────── گیرنده ───────────── */
export class AdminShippingInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name!: string;

  @ApiProperty({ example: '09121234567' })
  @Matches(/^0\d{10}$/, { message: 'شماره تماس معتبر نیست' })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ description: 'شناسه آدرس ذخیره‌شده (یا address)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  addressId?: number;

  @ApiPropertyOptional({ type: AdminAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminAddressDto)
  address?: AdminAddressDto;
}

export class UpdateAdminShippingInfoDto extends PartialType(
  OmitType(AdminShippingInfoDto, ['address', 'addressId'] as const),
) {
  @ApiPropertyOptional({ type: UpdateAdminAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAdminAddressDto)
  address?: UpdateAdminAddressDto;
}

/* ───────────── پرداخت ───────────── */
export class AdminPaymentInfoDto {
  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingCode?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paidAt?: Date | null;
}

/* ───────────── فیلدهای مشترک ایجاد/ویرایش ───────────── */
abstract class AdminOrderBaseDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ type: AdminPaymentInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminPaymentInfoDto)
  paymentInfo?: AdminPaymentInfoDto;

  @ApiPropertyOptional({ description: 'در ویرایش: رشته خالی = پاک کردن' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentRefId?: string;

  @ApiPropertyOptional({ description: 'در ویرایش: رشته خالی = پاک کردن' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  postalBarcode?: string;
}

/* ───────────── ایجاد سفارش ───────────── */
export class CreateOrderAdminDto extends AdminOrderBaseDto {
  @ApiPropertyOptional({
    description: 'شناسه کاربر (اختیاری؛ برای سفارش تلفنی)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiProperty({ type: [AdminOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک آیتم لازم است' })
  @ValidateNested({ each: true })
  @Type(() => AdminOrderItemDto)
  items!: AdminOrderItemDto[];

  @ApiProperty({ type: AdminShippingInfoDto })
  @ValidateNested()
  @Type(() => AdminShippingInfoDto)
  shippingInfo!: AdminShippingInfoDto;
}

/* ───────────── ویرایش سفارش ───────────── */
export class UpdateOrderAdminDto extends AdminOrderBaseDto {
  @ApiPropertyOptional({ type: [AdminOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک آیتم لازم است' })
  @ValidateNested({ each: true })
  @Type(() => AdminOrderItemDto)
  items?: AdminOrderItemDto[];

  @ApiPropertyOptional({ type: UpdateAdminShippingInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAdminShippingInfoDto)
  shippingInfo?: UpdateAdminShippingInfoDto;
}
