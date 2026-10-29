import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

// ---------- Category ----------
export class CreateCategoryDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string;
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

// ---------- Tag ----------
export class CreateTagDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
export class UpdateTagDto extends PartialType(CreateTagDto) {}

// ---------- Author ----------
export class CreateAuthorDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}

// ---------- Comment ----------
export class CreateCommentDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(2000)
  content: string;

  @IsNumber()
  articleId: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
