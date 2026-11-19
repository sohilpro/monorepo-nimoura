import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ManualAdjustmentDto {
  @IsInt({ message: 'شناسه کاربر نامعتبر است' })
  @Min(1, { message: 'شناسه کاربر باید بزرگتر از صفر باشد' })
  userId!: number;

  @IsInt({ message: 'مبلغ باید یک عدد صحیح باشد' })
  amount!: number;

  @IsString({ message: 'توضیحات باید متنی باشد' })
  @IsNotEmpty({ message: 'توضیحات الزامی است' })
  @MaxLength(500, { message: 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد' })
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  idempotencyKey?: string;
}
