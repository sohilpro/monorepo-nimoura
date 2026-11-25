import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

const VARIANTS = ['grid', 'scroll', 'circle', 'radial', 'hero-cards'] as const;
const ROLES = ['center', 'ring'] as const;

export class ShowcaseItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  id?: number | string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number | null;

  @ApiProperty({ enum: ROLES })
  @IsIn(ROLES)
  role!: (typeof ROLES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  badge?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keywords?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateShowcaseConfigDto {
  @ApiProperty({ description: 'کلید یکتا برای استفاده در بخشهای مختلف سایت' })
  @IsString()
  @MaxLength(100)
  key!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  highlight?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badgeText?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  allLink?: string | null;

  @ApiPropertyOptional({ enum: VARIANTS, default: 'grid' })
  @IsOptional()
  @IsIn(VARIANTS)
  variant?: (typeof VARIANTS)[number];

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showHeader?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ type: ShowcaseItemDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShowcaseItemDto)
  centerItem?: ShowcaseItemDto | null;

  @ApiPropertyOptional({ type: [ShowcaseItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShowcaseItemDto)
  items?: ShowcaseItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class UpdateShowcaseConfigDto extends PartialType(CreateShowcaseConfigDto) {}
