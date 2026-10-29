// reassign-media-owner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MediaOwnerType } from '../enums/media-owner-type.enum'; // مسیر انام پروژه شما

export class ReassignMediaOwnerDto {
  @ApiProperty({
    example: ['https://api.domain.com/uploads/p1.webp'],
    description: 'لیست آدرس‌های عمومی فایل‌های مدیا',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  publicUrls!: string[];

  @ApiProperty({
    enum: MediaOwnerType,
    example: MediaOwnerType.PRODUCT_GALLERY,
    description: 'نوع مالک جدید',
  })
  @IsEnum(MediaOwnerType)
  newOwnerType!: MediaOwnerType;

  @ApiProperty({
    example: '12',
    description: 'شناسه مالک جدید (به‌صورت رشته)',
  })
  @IsString()
  @IsNotEmpty()
  newOwnerId!: string;
}