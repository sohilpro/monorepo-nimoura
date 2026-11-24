import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ContactMessageDto {
  @IsString({ message: 'نام و نام خانوادگی باید متنی باشد' })
  @IsNotEmpty({ message: 'نام و نام خانوادگی الزامی است' })
  @MinLength(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' })
  @MaxLength(100, { message: 'نام حداکثر می‌تواند ۱۰۰ کاراکتر باشد' })
  name!: string;

  @IsString({ message: 'شماره موبایل نامعتبر است' })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  mobile!: string;

  @IsOptional()
  @IsEmail({}, { message: 'فرمت آدرس ایمیل نامعتبر است' })
  email?: string;

  @IsString({ message: 'موضوع پیام باید رشته باشد' })
  @IsNotEmpty({ message: 'انتخاب موضوع پیام الزامی است' })
  subject!: string;

  @IsOptional()
  @IsString({ message: 'شماره سفارش باید رشته باشد' })
  orderId?: string;

  @IsString({ message: 'متن پیام باید رشته باشد' })
  @IsNotEmpty({ message: 'متن پیام الزامی است' })
  @MinLength(5, { message: 'متن پیام باید حداقل ۵ کاراکتر باشد' })
  @MaxLength(2000, { message: 'متن پیام حداکثر ۲۰۰۰ کاراکتر است' })
  message!: string;
}
