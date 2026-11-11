import { ApiProperty } from '@nestjs/swagger';
import { AuthMessage } from 'src/common/auth/enums/auth-message.enum';
import { IsValidUsername } from 'src/common/auth/validators/is-username-valid.decorator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';

export class SendOtpDto {
  @ApiProperty({
    type: String,
    description: 'شماره تلفن یا آدرس ایمیل (فقط دامنه gmail مجاز است)',
    example: '09121234567 یا user@gmail.com',
  })
  @TrimString()
  @IsValidUsername({ message: AuthMessage.InValidUsername })
  username!: string;
}
