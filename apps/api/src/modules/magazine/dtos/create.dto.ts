import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ArticleStatus } from '../entities/articles.entity';
import { PaginationDto } from './pagination.dto';

export class CreateArticleDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(500)
  summary!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  coverImageAlt?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsNumber()
  authorId!: number;

  @IsNumber()
  categoryId!: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  relatedProductIds?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string;

  // اضافه کردن این فیلد برای رفع کامل خطا
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class QueryArticleDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  tagSlug?: string;

  @IsOptional()
  @IsString()
  authorSlug?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  // sort: latest | popular | most_liked
  @IsOptional()
  @IsString()
  sort?: 'latest' | 'popular' | 'most_liked';
}

// برای پنل ادمین: شامل مقالات پیش‌نویس/آرشیو هم می‌شود و بر اساس تاریخ ایجاد مرتب می‌شود
export class QueryArticleAdminDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  authorId?: number;
}
