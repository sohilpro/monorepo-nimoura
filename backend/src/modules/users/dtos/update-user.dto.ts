
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  Length,
  Matches,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "src/common/auth/jwt.types";

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: String,
    description: "نام کاربر",
    example: "علی",
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: "نام خانوادگی کاربر",
    example: "رضایی",
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    format: "email",
    description: "آدرس ایمیل کاربر",
    example: "user@example.com",
  })
  @IsOptional()
  @IsEmail(null as any, { message: "ایمیل باید از دامنه gmail.com باشد" })
  email?: string;

  @ApiPropertyOptional({
    type: String,
    description: "رمز عبور جدید (حداقل ۶ و حداکثر ۳۲ کاراکتر)",
    example: "StrongPass123",
  })
  @IsOptional()
  @IsString()
  @Length(6, 32)
  password?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: "نقش کاربر (مثلاً کاربر معمولی، ادمین، فروشنده و...)",
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    type: String,
    description: "شماره موبایل کاربر",
    example: "09121234567",
  })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({
    type: String,
    description: "کد ملی یا شماره شناسنامه (در صورت نیاز)",
    example: "1234567890",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: "کد ملی باید ۱۰ رقم باشد" })
  identity_card?: string;
}
