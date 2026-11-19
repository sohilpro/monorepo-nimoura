import { IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsInt({ message: 'مبلغ برداشت باید عدد صحیح باشد' })
  @Min(10000, { message: 'حداقل مبلغ برداشت ۱۰٬۰۰۰ تومان است' })
  amount!: number;

  @IsString({ message: 'شماره شبا باید متنی باشد' })
  @IsNotEmpty({ message: 'شماره شبا الزامی است' })
  @Length(24, 26, { message: 'شماره شبا باید بین ۲۴ تا ۲۶ کاراکتر باشد' })
  iban!: string;

  @IsOptional()
  @IsString()
  @Length(16, 19, { message: 'شماره کارت نامعتبر است' })
  cardNumber?: string;

  @IsString({ message: 'نام صاحب حساب الزامی است' })
  @IsNotEmpty({ message: 'نام صاحب حساب الزامی است' })
  @MaxLength(150, { message: 'نام صاحب حساب حداکثر ۱۵۰ کاراکتر است' })
  accountHolderName!: string;
}
