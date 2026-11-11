import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UserRole } from 'src/common/auth/jwt.types';
import { emptyToUndefined } from 'src/common/utils/transform.helper';

const toBool = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
};

export const USER_SORTABLE_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'first_name',
  'last_name',
  'mobile',
  'email',
  'role',
] as const;

export class AdminUsersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'جستجو در نام، موبایل، ایمیل، کد ملی یا شناسه',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: USER_SORTABLE_FIELDS, default: 'id' })
  @IsOptional()
  @IsIn(USER_SORTABLE_FIELDS)
  sortBy?: string;

  @ApiPropertyOptional({
    enum: USER_SORTABLE_FIELDS,
    description: 'نام مستعار sortBy برای سازگاری با جدول‌های پنل',
  })
  @IsOptional()
  @IsIn(USER_SORTABLE_FIELDS)
  sort?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ enum: UserRole, description: 'فیلتر بر اساس نقش' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'فیلتر وضعیت تأیید موبایل' })
  @Transform(toBool)
  @IsOptional()
  @IsBoolean()
  verify_mobile?: boolean;

  @ApiPropertyOptional({ description: 'فیلتر وضعیت تأیید ایمیل' })
  @Transform(toBool)
  @IsOptional()
  @IsBoolean()
  verify_email?: boolean;
}
