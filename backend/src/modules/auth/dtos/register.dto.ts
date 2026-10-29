import { ApiProperty } from '@nestjs/swagger';
import { AuthMessage } from '../../../common/auth/enums/auth-message.enum';
import { Length, MinLength } from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';
import { IsValidUsername } from '../../../common/auth/validators/is-username-valid.decorator';

export class RegisterDto {
  @ApiProperty({
    type: String,
    description: 'نام کاربر (بین ۳ تا ۳۰ کاراکتر)',
    example: 'علی',
  })
  @TrimString()
  @Length(3, 30, { message: AuthMessage.NameLength })
  first_name!: string;

  @ApiProperty({
    type: String,
    description: 'نام خانوادگی کاربر (بین ۳ تا ۳۰ کاراکتر)',
    example: 'رضایی',
  })
  @TrimString()
  @Length(3, 30, { message: AuthMessage.NameLength })
  last_name!: string;

  @ApiProperty({
    type: String,
    description: 'شماره موبایل یا ایمیل (تنها gmail مجاز است)',
    example: '09121234567 یا user@gmail.com',
  })
  @TrimString()
  @IsValidUsername({ message: AuthMessage.InValidUsername })
  username!: string;

  @ApiProperty({
    type: String,
    description: 'رمز عبور (حداقل ۶ کاراکتر)',
    example: 'StrongPass123',
  })
  @TrimString()
  @MinLength(6, { message: AuthMessage.PassMinLength })
  password!: string;
}
