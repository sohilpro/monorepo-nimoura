import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateLoyaltySettingsDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsInt() @Min(0) weeklyReward?: number;
  @IsOptional() @IsInt() @Min(0) cashbackMinOrder?: number;
  @IsOptional() @IsInt() @Min(0) cashbackAmount?: number;
  @IsOptional() @IsBoolean() cashbackEnabled?: boolean;
  @IsOptional() @IsBoolean() autoRedeem?: boolean;
}
