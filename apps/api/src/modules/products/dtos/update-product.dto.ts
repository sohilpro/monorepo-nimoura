import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
function coerceToNumberArray(input: unknown): number[] {
  if (Array.isArray(input)) {
    return input
      .flatMap((v: unknown): unknown =>
        typeof v === 'string' && v.startsWith('[')
          ? (JSON.parse(v) as unknown)
          : v,
      )
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));
  }

  if (typeof input === 'string') {
    const s = input.trim();
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const arr: unknown = JSON.parse(s);
        return Array.isArray(arr)
          ? arr.map(Number).filter(Number.isFinite)
          : [];
      } catch {
        return [];
      }
    }

    return s.split(',').map(Number).filter(Number.isFinite);
  }

  if (typeof input === 'number') return [input];
  return [];
}

const toBoolean = ({ value }: { value: any }) =>
  value === true || value === 'true' || value === '1' || value === 1;
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  removeOldThumbnail?: boolean;

  @Transform(({ value }) => coerceToNumberArray(value))
  @IsOptional()
  @IsArray()
  imagesToDelete?: (number | string)[];
}
