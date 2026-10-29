import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ValidatePriceItem {
  @ApiProperty({
    type: Number,
    description: 'شناسه محصول',
    example: 123,
  })
  productId!: number;

  @ApiProperty({
    type: Number,
    description: 'تعداد انتخاب‌شده از محصول',
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    type: Number,
    description: 'قیمتی که کاربر هنگام افزودن به سبد مشاهده کرده',
    example: 150000,
  })
  clientPrice!: number;
}

export class ValidatePriceDto {
  @ApiProperty({
    type: [ValidatePriceItem],
    description: 'لیست محصولات برای بررسی صحت قیمت‌ها',
  })
  @IsArray()
  items!: ValidatePriceItem[];
}
