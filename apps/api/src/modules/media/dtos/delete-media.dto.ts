// dtos/delete-media.dto.ts
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class DeleteMediaDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  urls!: string[];
}