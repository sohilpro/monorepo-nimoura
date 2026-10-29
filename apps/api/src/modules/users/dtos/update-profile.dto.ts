import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIdentityCard,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    type: String,
    format: 'email',
    description: 'آدرس ایمیل جدید (فقط gmail مجاز است)',
    example: 'user@gmail.com',
  })
  @IsOptional()
  @TrimString()
  @IsEmail(
    { host_whitelist: ['gmail.com'] },
    { message: 'ایمیل باید از دامنه gmail.com باشد' },
  )
  @Transform(({ value }) => (value === '' ? null : value))
  email?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'کد ملی معتبر (۱۰ رقمی)',
    example: '1234567890',
  })
  @IsOptional()
  @IsIdentityCard('IR', { message: 'کد ملی وارد شده معتبر نیست' })
  @Matches(/^\d{10}$/, { message: 'کد ملی باید ۱۰ رقم باشد' })
  @Transform(({ value }) => (value === '' ? null : value))
  identity_card?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'نام',
    example: 'علی',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'نام خانوادگی',
    example: 'رضایی',
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'رمز عبور جدید (حداقل ۶ و حداکثر ۳۲ کاراکتر)',
    example: 'StrongPass123',
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @Length(6, 32, { message: 'رمز عبور باید حداقل ۶ و حداکثر ۳۲ کاراکتر باشد' })
  password?: string;
}
