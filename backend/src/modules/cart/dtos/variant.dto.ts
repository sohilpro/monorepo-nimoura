import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class VariantDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'شناسه واریانت (درصورت وجود)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'رنگ یا مقدار واریانت',
    example: '#B76E79',
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'نام واریانت (مثلاً رنگ یا سایز)',
    example: 'رزگلد',
  })
  @IsOptional()
  @IsString()
  alt?: string;
}
