// backend/src/comments/dto/create-comment.dto.ts
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId!: number;

  @ApiProperty({ example: 'کیفیت عالی' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'محصول بسیار عالی و باکیفیتی بود...' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: ['/uploads/comments/img1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
