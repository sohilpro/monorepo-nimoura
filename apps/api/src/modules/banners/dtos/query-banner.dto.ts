import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BannerStatus, BannerDevice } from '../enums';
import { emptyToUndefined } from 'src/common/utils/transform.helper';

export class QueryBannerDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number;

  @ApiPropertyOptional({ enum: BannerStatus })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;

  @ApiPropertyOptional({ enum: BannerDevice })
  @IsOptional()
  @IsEnum(BannerDevice)
  device?: BannerDevice;

  @ApiPropertyOptional({ description: 'جستجو در عنوان' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'sortOrder' })
  @IsOptional()
  @IsIn(['sortOrder', 'createdAt', 'views', 'clicks', 'title'])
  sortBy?: string = 'sortOrder';

  @ApiPropertyOptional({ default: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDir?: 'ASC' | 'DESC' = 'ASC';
}
