import { IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'کلید یکتا مثل home-hero-slider' })
  @IsString()
  @MaxLength(100)
  key: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  recommendedWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  recommendedHeight?: number;

  @ApiPropertyOptional({ default: 0, description: '0 = نامحدود' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxItems?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePositionDto extends PartialType(CreatePositionDto) {}
