import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LoyaltyWithdrawalStatus } from '../enums/loyalty-withdrawal-status.enum';

export class ProcessWithdrawalDto {
  @IsEnum(LoyaltyWithdrawalStatus, { message: 'وضعیت نامعتبر است' })
  status!: LoyaltyWithdrawalStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد' })
  adminNote?: string;
}
