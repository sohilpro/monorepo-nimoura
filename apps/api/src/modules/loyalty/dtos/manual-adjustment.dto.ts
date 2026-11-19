import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class ManualAdjustmentDto {
  @IsInt() amount!: number;
  @IsString() description!: string;
  @IsOptional() @IsInt() @Min(1) userId?: number;
}
