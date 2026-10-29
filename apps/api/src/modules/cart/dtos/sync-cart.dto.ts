import { IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto } from './cart-item.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncCartDto {
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'شناسه کاربر مهمان (برای همگام‌سازی سبد در حالت ورود)',
    example: 'a2d73e70-3c5b-4f4e-b2f6-d7d1d27b9a70',
  })
  @IsOptional()
  @IsUUID()
  guestId?: string;

  @ApiProperty({
    type: [CartItemDto],
    description: 'لیست آیتم‌های سبد خرید جهت همگام‌سازی',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];
}
