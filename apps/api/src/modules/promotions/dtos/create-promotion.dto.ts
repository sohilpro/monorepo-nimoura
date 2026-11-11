import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  IsDate,
  IsArray,
} from 'class-validator';
import { PromotionType } from '../entities/promotion.entity';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({
    type: String,
    description: 'عنوان تخفیف (برای نمایش در پنل مدیریت یا گزارش‌ها)',
    example: 'تخفیف ویژه تابستان',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    type: String,
    description: 'توضیحات اختیاری درباره‌ی این تخفیف',
    example: 'این تخفیف فقط برای محصولات منتخب تابستانی اعمال می‌شود.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: PromotionType,
    description: 'نوع تخفیف (درصدی یا ثابت)',
    example: PromotionType.PERCENTAGE,
  })
  @IsEnum(PromotionType)
  type!: PromotionType;

  @ApiProperty({
    type: Number,
    description: 'مقدار تخفیف (درصد یا مبلغ ثابت، وابسته به نوع)',
    example: 20,
  })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({
    type: String,
    description: 'کد تخفیف (در صورت غیردستی بودن کد، این مقدار اختیاری است)',
    example: 'OFF20',
  })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'تاریخ شروع تخفیف',
    example: '2025-08-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'تاریخ پایان تخفیف',
    example: '2025-08-15T23:59:59.000Z',
  })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @ApiProperty({
    type: Boolean,
    description: 'آیا این تخفیف عمومی است یا فقط برای کاربران خاص؟',
    example: true,
  })
  @IsBoolean()
  isPublic!: boolean;

  @ApiPropertyOptional({
    type: [Number],
    description: 'لیست شناسه محصولات مشمول این تخفیف (اختیاری)',
    example: [101, 102, 103],
  })
  @IsOptional()
  @IsArray()
  productIds?: number[];

  @ApiPropertyOptional({
    type: [Number],
    description:
      'لیست شناسه دسته‌بندی‌هایی که تخفیف روی آن‌ها اعمال می‌شود (اختیاری)',
    example: [5, 7],
  })
  @IsOptional()
  @IsArray()
  categoryIds?: number[];

  @ApiPropertyOptional({
    type: [Number],
    description: 'لیست شناسه برند ها که تخفیف روی آن‌ها اعمال می‌شود (اختیاری)',
    example: [5, 7],
  })
  @IsOptional()
  @IsArray()
  brandIds?: number[];
}
