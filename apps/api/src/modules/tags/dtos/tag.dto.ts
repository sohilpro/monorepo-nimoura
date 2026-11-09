import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
};

export class CreateTagDto {
  @ApiProperty({ example: 1, description: 'شناسه گروه تگ' })
  @Type(() => Number)
  @IsInt()
  groupId!: number;

  @ApiProperty({ example: 'پوست چرب' })
  @IsString()
  @IsNotEmpty({ message: 'نام تگ الزامی است.' })
  @MaxLength(128)
  name!: string;

  @ApiPropertyOptional({ description: 'اگر خالی باشد از نام ساخته می‌شود' })
  @IsOptional()
  @IsString()
  @Matches(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u, { message: 'شناسه تگ نامعتبر است.' })
  @MaxLength(160)
  slug?: string;

  @ApiPropertyOptional({ example: '#B76E79' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'رنگ باید به فرمت #RRGGBB باشد.' })
  color?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}

export class BulkCreateTagsDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  groupId!: number;

  @ApiProperty({ type: [String], example: ['چرب', 'خشک', 'مختلط'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(128, { each: true })
  names!: string[];
}

export class MergeTagsDto {
  @ApiProperty({ description: 'تگی که حذف می‌شود' })
  @Type(() => Number)
  @IsInt()
  sourceId!: number;

  @ApiProperty({ description: 'تگی که محصولات به آن منتقل می‌شوند' })
  @Type(() => Number)
  @IsInt()
  targetId!: number;
}

export class ListTagsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({ description: 'جستجو در نام تگ' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
