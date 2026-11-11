import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class BulkDeleteUsersDto {
  @ApiProperty({ type: [Number], example: [12, 15] })
  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک کاربر باید انتخاب شود.' })
  @ArrayMaxSize(100)
  @Type(() => Number)
  @IsInt({ each: true })
  ids!: number[];
}
