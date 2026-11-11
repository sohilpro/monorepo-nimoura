import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/modules/users/addresses/dtos/create-address.dto';

export class ShippingInfoDto {
  @ApiProperty({
    description: 'نام گیرنده',
    minLength: 2,
    maxLength: 100,
    example: 'علی',
  })
  @IsString()
  @Length(2, 100)
  first_name!: string;

  @ApiProperty({
    description: 'نام خانوادگی گیرنده',
    minLength: 2,
    maxLength: 100,
    example: 'رضایی',
  })
  @IsString()
  @Length(2, 100)
  last_name!: string;

  @ApiProperty({ description: 'شماره موبایل گیرنده', example: '09121234567' })
  @IsString()
  @Matches(/^(\+98|0)?9\d{9}$/, { message: 'شماره تلفن معتبر نیست' })
  phone!: string;

  @ApiPropertyOptional({ description: 'یادداشت اختیاری (مثلاً نحوه‌ی تحویل)' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    type: Number,
    description:
      'شناسه‌ی آدرس ذخیره‌شده‌ی کاربر. اگر ارسال نشود، «address» الزامی است',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  addressId?: number;

  @ApiPropertyOptional({
    type: CreateAddressDto,
    description: 'آدرس جدید (در صورت نبودن addressId)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;
}
