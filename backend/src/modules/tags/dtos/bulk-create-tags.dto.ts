import { ArrayMaxSize, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateTagDto } from "./create-tag.dto";

export class BulkCreateTagsDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  items!: CreateTagDto[];
}
