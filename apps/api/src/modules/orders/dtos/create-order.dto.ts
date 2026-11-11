import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ShippingInfoDto } from './shipping-info.dto';
import { PaymentInfoDto } from './payment-info.dto';
import { refToIdNumber } from 'src/common/utils/transform.helper';

export class OrderItemDto {
  @ApiProperty({ type: Number, description: 'شناسه محصول', example: 101 })
  @Type(() => Number)
  @IsInt({ message: 'شناسه محصول باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه محصول باید بزرگتر از صفر باشد' })
  productId!: number;

  @ApiProperty({ type: Number, description: 'تعداد', example: 3 })
  @Type(() => Number)
  @IsInt({ message: 'تعداد باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'تعداد باید حداقل ۱ باشد' })
  quantity!: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'شناسه تنوع (واریانت)',
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'شناسه تنوع باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه تنوع باید بزرگتر از صفر باشد' })
  variantId?: number | null;

  /** فرمت قدیمی فرانت: عدد یا آبجکت `{ id }`. به عدد نرمال می‌شود. */
  @ApiPropertyOptional({
    description:
      'شناسه یا آبجکت تنوع (سازگاری با فرانت قدیمی؛ ترجیحاً variantId)',
    example: { id: 15 },
  })
  @IsOptional()
  @Transform(refToIdNumber)
  @IsInt({ message: 'شناسه تنوع باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه تنوع باید بزرگتر از صفر باشد' })
  variant?: number | null;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'اقلام سفارش' })
  @IsArray({ message: 'لیست آیتم‌های سفارش باید به‌صورت آرایه ارسال شود' })
  @ArrayMinSize(1, { message: 'حداقل یک آیتم لازم است' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({ type: ShippingInfoDto, description: 'اطلاعات گیرنده و آدرس' })
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shippingInfo!: ShippingInfoDto;

  @ApiProperty({ type: PaymentInfoDto, description: 'اطلاعات پرداخت' })
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo!: PaymentInfoDto;

  /** فعلاً توسط سرور اعمال نمی‌شود (نیازمند API ماژول پروموشن) */
  @ApiPropertyOptional({
    type: Number,
    description: 'شناسه کد تخفیف',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'شناسه پروموشن باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه پروموشن باید بزرگتر از صفر باشد' })
  promotionId?: number;

  /** فعلاً هزینه‌ی ارسال سمت سرور صفر است و این فیلد نادیده گرفته می‌شود */
  @ApiPropertyOptional({
    type: String,
    description: 'روش ارسال (فعلاً نادیده گرفته می‌شود)',
    example: 'post',
  })
  @IsOptional()
  @IsString({ message: 'اطلاعات هزینه ارسال باید رشته باشد' })
  shippingCost?: string;

  @ApiPropertyOptional({ description: 'شناسه کلیک ترب' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{8,100}$/, { message: 'torobClid نامعتبر است' })
  torobClid?: string;
}
