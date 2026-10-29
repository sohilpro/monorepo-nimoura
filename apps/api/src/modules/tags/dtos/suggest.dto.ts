import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ALLOWED_TYPES } from '../constants/tags.constant';

export class SuggestQueryDto {
  @IsString()
  @IsIn(ALLOWED_TYPES as any)
  type!: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}
