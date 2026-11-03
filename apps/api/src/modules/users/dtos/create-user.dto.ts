import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/common/auth/jwt.types';

export class CreateUserDto {
  @ApiProperty({
    example: '09121234567',
    description: 'شماره موبایل معتبر (۱۱ رقم با پیشوند ۰)',
  })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @IsString()
  @Matches(/^0\d{10}$/, { message: 'شماره موبایل نامعتبر است (باید ۱۱ رقم و با ۰ شروع شود)' })
  mobile!: string;

  @ApiPropertyOptional({ example: 'علی' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'رضایی' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email?: string;

  @ApiPropertyOptional({ example: 'Password123' })
  @IsOptional()
  @IsString()
  @Length(6, 32, { message: 'رمز عبور باید بین ۶ تا ۳۲ کاراکتر باشد' })
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.USER;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'کد ملی باید ۱۰ رقم باشد' })
  identity_card?: string;
}
