import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/common/auth/jwt.types';
import { IR_MOBILE_REGEX } from 'src/common/utils/mobile.helper';

const toEnDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const trimOrUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value === null ? undefined : value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizeDigitStringOrUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value === null ? undefined : value;
  const trimmed = toEnDigits(value).trim();
  return trimmed === '' ? undefined : trimmed;
};

const toBoolOptional = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
};

export class CreateUserDto {
  @ApiProperty({
    example: '09121234567',
    description: 'شماره موبایل معتبر (۱۱ رقم با پیشوند ۰۹)',
  })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? toEnDigits(value).trim() : value,
  )
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @IsString()
  @Matches(IR_MOBILE_REGEX, {
    message: 'شماره موبایل نامعتبر است (باید ۱۱ رقم و با ۰۹ شروع شود)',
  })
  mobile!: string;

  @ApiPropertyOptional({ example: 'علی' })
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'رضایی' })
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @Transform(({ value }) => {
    const cleaned = trimOrUndefined({ value });
    return typeof cleaned === 'string' ? cleaned.toLowerCase() : cleaned;
  })
  @IsOptional()
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email?: string;

  @ApiPropertyOptional({ example: 'Password123' })
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  @Length(6, 32, { message: 'رمز عبور باید بین ۶ تا ۳۲ کاراکتر باشد' })
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole, { message: 'نقش کاربر نامعتبر است' })
  role?: UserRole = UserRole.USER;

  @ApiPropertyOptional({ example: '1234567890' })
  @Transform(normalizeDigitStringOrUndefined)
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'کد ملی باید ۱۰ رقم باشد' })
  identity_card?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'وضعیت تأیید شماره موبایل',
  })
  @Transform(toBoolOptional)
  @IsOptional()
  @IsBoolean()
  verify_mobile?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'وضعیت تأیید ایمیل',
  })
  @Transform(toBoolOptional)
  @IsOptional()
  @IsBoolean()
  verify_email?: boolean;
}
