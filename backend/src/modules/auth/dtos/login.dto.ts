import { ApiProperty } from "@nestjs/swagger";
import { TrimString } from "src/common/decorators/trim-string.decorator";

export class LoginDto {
  @ApiProperty({
    type: String,
    description: "نام کاربری: شماره تلفن یا ایمیل (فقط gmail مجاز است)",
    example: "09123456789 یا example@gmail.com",
  })
  @TrimString()
  username!: string;

  @ApiProperty({
    type: String,
    description: "رمز عبور کاربر",
    example: "SecureP@ssw0rd",
  })
  @TrimString()
  password!: string;
}
