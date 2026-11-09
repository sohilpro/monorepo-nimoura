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
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTagGroupDto {
  @ApiProperty({ example: 'نوع پوست' })
  @IsString()
  @IsNotEmpty({ message: 'نام گروه تگ الزامی است.' })
  @MaxLength(64)
  name!: string;

  @ApiPropertyOptional({ example: 'skin-type', description: 'اگر خالی باشد از نام ساخته می‌شود' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'شناسه گروه فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.',
  })
  @MaxLength(64)
  slug?: string;

  @ApiPropertyOptional({ example: 'pi pi-heart' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

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

  @ApiPropertyOptional({ default: true, description: 'نمایش در فیلترهای فروشگاه' })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;
}

export class UpdateTagGroupDto extends PartialType(CreateTagGroupDto) {}

export class ReorderDto {
  @ApiProperty({ type: [Number], description: 'شناسه‌ها به ترتیب جدید' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @Type(() => Number)
  @IsInt({ each: true })
  ids!: number[];
}
