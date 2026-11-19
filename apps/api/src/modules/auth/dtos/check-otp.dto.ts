import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { IsValidUsername } from 'src/common/auth/validators/is-username-valid.decorator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';

export class CheckOtpDto {
  @ApiProperty({
    type: String,
    description: 'نام کاربری (ایمیل یا شماره موبایل که کد برای آن ارسال شده)',
    example: '09121234567',
  })
  @TrimString()
  @IsValidUsername()
  username!: string;

  @ApiProperty({
    type: String,
    description: 'کد تأیید 5 رقمی ارسال‌شده',
    example: '439201',
  })
  @TrimString()
  @Length(5, 5, { message: 'کد باید 5 رقمی باشد' })
  code!: string;

  @ApiPropertyOptional({
    type: String,
    description: 'کد معرف اختیاری',
    example: 'REF-NM7X9K',
  })
  @IsOptional()
  @IsString()
  @TrimString()
  referralCode?: string;
}
