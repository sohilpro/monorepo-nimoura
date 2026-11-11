import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trimIfString } from 'src/common/utils/transform.helper';

export class VerifyPaymentDto {
  @ApiProperty({
    example: 'A00000000000000000000000000123456789',
    description: 'کد یکتای تراکنش برگشتی از زرین‌پال (Authority)',
  })
  @IsString()
  @Transform(trimIfString)
  Authority!: string;

  @ApiProperty({
    enum: ['OK', 'NOK'],
    description: 'وضعیت پرداخت برگشتی از درگاه',
  })
  @IsString()
  Status!: string;
}
