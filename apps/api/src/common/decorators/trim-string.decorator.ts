import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export const TrimString = () => {
  return applyDecorators(
    IsString(),
    Transform(({ value }: { value: string }) => value.trim())
  );
};
