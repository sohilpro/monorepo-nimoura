import { IsString, IsIn } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentStatus } from "../enum/status-payment.enum";

export class VerifyPaymentDto {
  @ApiProperty({
    example: "A00000000000000000000000000123456789",
    description: "کد یکتای تراکنش برگشتی از زرین‌پال (Authority)",
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  Authority!: string;

  @ApiProperty({ enum: PaymentStatus, description: "وضعیت پرداخت" })
  @IsString()
  Status!: PaymentStatus;
}
