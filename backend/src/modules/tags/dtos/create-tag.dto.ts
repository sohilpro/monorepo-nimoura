import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ALLOWED_TYPES } from '../constants/tags.constant';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_TYPES as any)
  type!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  value!: string;
}
