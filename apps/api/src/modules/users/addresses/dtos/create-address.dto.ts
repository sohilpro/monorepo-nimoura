import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class CreateAddressDto {
  @ApiProperty({
    description: "عنوان آدرس (مثلاً: خانه، محل کار)",
    example: "خانه",
  })
  @IsString()
  @Length(2, 50)
  title!: string;

  @ApiProperty({
    description: "کد پستی ۱۰ رقمی",
    example: "1234567890",
  })
  @IsString()
  @Length(10, 10, { message: "Postal code must be exactly 10 digits" })
  postal_code!: string;

  @ApiProperty({
    description: "نام استان",
    example: "تهران",
  })
  @IsString()
  @Length(2, 50)
  state!: string;

  @ApiProperty({
    description: "نام شهر",
    example: "تهران",
  })
  @IsString()
  @Length(2, 50)
  city!: string;

  @ApiProperty({
    description: "آدرس کامل (خیابان، پلاک، واحد و ...)",
    example: "خیابان ولیعصر، پلاک ۱۲، واحد ۳",
  })
  @IsString()
  @Length(5, 255)
  address!: string;
}
