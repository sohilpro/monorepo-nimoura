import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExploreDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;
}
