import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({
    description: 'شماره موبایل یا آدرس ایمیل',
    example: '09123456789 یا info@example.com',
  })
  @IsString({ message: 'مقدار ورودی باید متنی باشد' })
  @IsNotEmpty({ message: 'لطفاً شماره موبایل یا ایمیل خود را وارد کنید' })
  @MaxLength(150, { message: 'طول ورودی بیش از حد مجاز است' })
  contact!: string;

  @ApiPropertyOptional({ description: 'نام کاربر', example: 'سارا' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'محل ثبت‌نام', example: 'footer' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}
