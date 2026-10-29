import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { PriceTierDto } from "./product-price-tier.dto";

export class CreateVariantDto {
  @ApiProperty({
    type: String,
    description: "مقدار واریانت (مثلاً رنگ، سایز، حجم و...)",
    example: "#fff",
  })
  @IsString()
  value!: string;

  @ApiPropertyOptional({
    type: Number,
    description: "قیمت اختصاصی این واریانت (در صورت وجود)",
    example: 120000,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    type: Number,
    description: "موجودی انبار برای این واریانت",
    example: 10,
  })
  @IsNumber()
  stock!: number;

  @ApiProperty({
    type: String,
    description: "توضیحات رنگ و تنوع برای نمایش",
    example: "قرمز",
  })
  @IsString()
  alt!: string;

  @ApiPropertyOptional({
    type: [String],
    description: "لیست تصاویر اختصاصی این واریانت",
    example: ["https://api.domain.com/uploads/var1.webp", "https://api.domain.com/uploads/var2.webp"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [PriceTierDto], description: 'پله‌های قیمتی این واریانت' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return []; }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  priceTiers?: PriceTierDto[];
}