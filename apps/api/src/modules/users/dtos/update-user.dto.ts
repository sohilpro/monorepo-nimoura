import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/common/auth/jwt.types';

const toEnDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/** Trims strings and converts empty strings to null so admins can clear nullable fields. */
const trimToNullIfEmpty = ({ value }: { value: unknown }) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const normalizeDigitsToNullIfEmpty = ({ value }: { value: unknown }) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = toEnDigits(value).trim();
  return trimmed === '' ? null : trimmed;
};

const toBoolOptional = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
};

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'نام کاربر',
    example: 'علی',
  })
  @Transform(trimToNullIfEmpty)
  @IsOptional()
  @IsString()
  first_name?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'نام خانوادگی کاربر',
    example: 'رضایی',
  })
  @Transform(trimToNullIfEmpty)
  @IsOptional()
  @IsString()
  last_name?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    format: 'email',
    description: 'آدرس ایمیل کاربر',
    example: 'user@example.com',
  })
  @Transform(({ value }) => {
    const cleaned = trimToNullIfEmpty({ value });
    return typeof cleaned === 'string' ? cleaned.toLowerCase() : cleaned;
  })
  @IsOptional()
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'رمز عبور جدید (حداقل ۶ و حداکثر ۳۲ کاراکتر)',
    example: 'StrongPass123',
  })
  @Transform(({ value }: TransformFnParams): unknown => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  })
  @IsOptional()
  @IsString()
  @Length(6, 32, { message: 'رمز عبور باید بین ۶ تا ۳۲ کاراکتر باشد' })
  password?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'نقش کاربر',
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'نقش کاربر نامعتبر است' })
  role?: UserRole;

  @ApiPropertyOptional({
    type: String,
    description: 'شماره موبایل کاربر',
    example: '09121234567',
  })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? toEnDigits(value).trim() : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل نامعتبر است (باید ۱۱ رقم و با ۰۹ شروع شود)',
  })
  mobile?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'کد ملی ۱۰ رقمی',
    example: '1234567890',
  })
  @Transform(normalizeDigitsToNullIfEmpty)
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'کد ملی باید ۱۰ رقم باشد' })
  identity_card?: string | null;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'وضعیت تأیید شماره موبایل',
  })
  @Transform(toBoolOptional)
  @IsOptional()
  @IsBoolean()
  verify_mobile?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'وضعیت تأیید ایمیل',
  })
  @Transform(toBoolOptional)
  @IsOptional()
  @IsBoolean()
  verify_email?: boolean;
}
