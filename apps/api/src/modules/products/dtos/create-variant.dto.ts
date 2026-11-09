import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ATTRIBUTE_KINDS,
  HEX_COLOR_REGEX,
  type AttributeKind,
} from '../constants/attribute-kind';

export class VariantAttributeValueDto {
  @ApiProperty({ example: 'رنگ', description: 'نام ویژگی (حجم، وزن، رنگ و...)' })
  @IsString()
  @IsNotEmpty({ message: 'نام ویژگی تنوع الزامی است.' })
  @MaxLength(50)
  attributeName!: string;

  @ApiPropertyOptional({ enum: ATTRIBUTE_KINDS, example: 'color' })
  @IsOptional()
  @IsEnum(ATTRIBUTE_KINDS, { message: 'نوع ویژگی نامعتبر است.' })
  kind?: AttributeKind;

  @ApiProperty({ example: 'رزگلد', description: 'مقدار نمایشی، مثل «۵۰۰ میلی‌لیتر» یا «رزگلد»' })
  @IsString()
  @IsNotEmpty({ message: 'مقدار ویژگی تنوع الزامی است.' })
  @MaxLength(100)
  value!: string;

  @ApiPropertyOptional({ example: '#B76E79', description: 'کد رنگ (فقط برای ویژگی رنگی)' })
  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, { message: 'کد رنگ باید به فرمت #RRGGBB باشد.' })
  colorHex?: string;
}

export class CreateVariantDto {
  @ApiPropertyOptional({ description: 'شناسه تنوع موجود (فقط هنگام ویرایش)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ description: 'کد انبارداری یکتا؛ در صورت خالی بودن خودکار ساخته می‌شود' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ example: 120000, description: 'قیمت اصلی این تنوع (تومان)' })
  @Type(() => Number)
  @IsInt({ message: 'قیمت تنوع باید عدد صحیح باشد.' })
  @Min(1, { message: 'قیمت تنوع باید بزرگ‌تر از صفر باشد.' })
  price!: number;

  @ApiPropertyOptional({ example: 99000, description: 'قیمت با تخفیف' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceDiscount?: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt({ message: 'موجودی تنوع باید عدد صحیح باشد.' })
  @Min(0, { message: 'موجودی تنوع نمی‌تواند منفی باشد.' })
  stock!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'تصاویر اختصاصی تنوع' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: [VariantAttributeValueDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'هر تنوع باید حداقل یک ویژگی (مثل حجم یا رنگ) داشته باشد.' })
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeValueDto)
  attributeValues!: VariantAttributeValueDto[];
}
