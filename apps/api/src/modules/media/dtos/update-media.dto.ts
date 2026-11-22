import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaOwnerType } from '../enums/media-owner-type.enum';

export class UpdateMediaDto {
  @ApiPropertyOptional({ enum: MediaOwnerType })
  @IsOptional()
  @IsEnum(MediaOwnerType)
  ownerType?: MediaOwnerType;

  @ApiPropertyOptional({ description: 'شناسه مالک جدید' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'نام نمایشی یا اصلی فایل' })
  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiPropertyOptional({ description: 'ترتیب نمایش' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}
