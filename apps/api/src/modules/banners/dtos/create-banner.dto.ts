import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  IsObject,
  MaxLength,
  Min,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerStatus, BannerDevice, LinkTarget } from '../enums';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'آدرس تصویر آپلود شده (دسکتاپ)' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'آدرس تصویر اختصاصی موبایل' })
  @IsOptional()
  @IsString()
  mobileImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ enum: LinkTarget, default: LinkTarget.SELF })
  @IsOptional()
  @IsEnum(LinkTarget)
  linkTarget?: LinkTarget;

  @ApiProperty({ 
    description: 'شناسه‌ی جایگاه نمایش بنر (BannerPosition)', 
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: 'شناسه جایگاه باید یک عدد صحیح باشد' })
  @IsPositive({ message: 'شناسه جایگاه باید بزرگتر از صفر باشد' })
  positionId: number;

  @ApiPropertyOptional({ enum: BannerDevice, default: BannerDevice.ALL })
  @IsOptional()
  @IsEnum(BannerDevice)
  device?: BannerDevice;

  @ApiPropertyOptional({ enum: BannerStatus, default: BannerStatus.DRAFT })
  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({
    description:
      'داده‌ی آزاد و انعطاف‌پذیر برای هر پروژه (altText, ctaText, ...)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
