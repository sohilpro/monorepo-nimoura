import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { CreateVariantDto } from './create-variant.dto';
import { BundleItemDto } from './create-bundle.dto';

const toBoolean = ({ value }: { value: any }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value === true || value === 'true' || value === '1' || value === 1;
};

export class SpecificationItemDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  value!: string;
}

export class CreateProductDto {
  @ApiProperty({
    example: 3,
    description: 'شناسه دسته‌بندی محصول',
  })
  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @ApiPropertyOptional({
    description: 'تصویر شاخص محصول',
    example: 'https://api.domain.com/uploads/thumb.webp',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'گالری تصاویر عمومی محصول (قابل استفاده برای تمام انواع محصول)',
    example: ['https://api.domain.com/uploads/p1.webp'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    example: 2,
    description: 'شناسه برند محصول',
  })
  @Type(() => Number)
  @IsInt()
  brandId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'شناسه زیر برند محصول (اختیاری)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subBrandId?: number | null;

  @ApiProperty({
    example: 'کرم ضد آفتاب SPF50 نیتروژنا',
    description: 'عنوان محصول به زبان فارسی',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Neutrogena Sunscreen SPF50',
    description: 'عنوان محصول به زبان انگلیسی',
  })
  @IsString()
  englishTitle!: string;

  @ApiProperty({
    example: 450000,
    description: 'قیمت اصلی محصول (به تومان)',
  })
  @Type(() => Number)
  @IsInt()
  price!: number;

  @ApiProperty({
    example: 390000,
    description: 'قیمت پس از تخفیف (اختیاری)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priceDiscount?: number;

  @ApiProperty({
    example: 'محافظت از پوست در برابر اشعه‌های مضر آفتاب',
    description: 'توضیح کوتاه درباره محصول',
  })
  @IsString()
  shortDescription!: string;

  @ApiProperty({
    example: [
      { key: 'حجم', value: '50 میلی‌لیتر' },
      { key: 'نوع پوست', value: 'چرب و مختلط' },
    ],
    description: 'مشخصات فنی محصول به صورت کلید-مقدار',
    type: [SpecificationItemDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    let parsed = value;

    // اگر از طریق multipart/form-data به شکل رشته آمده باشد
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return [];
      }
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    // فیلتر کردن و تبدیل صریح هر آیتم به نمونه‌ای از کلاس SpecificationItemDto
    return parsed
      .filter(
        (item) => item && typeof item === 'object' && !Array.isArray(item),
      )
      .map((item) =>
        plainToInstance(SpecificationItemDto, {
          key: String(item.key || '').trim(),
          value: String(item.value || '').trim(),
        }),
      )
      .filter((item) => item.key !== '');
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationItemDto)
  specifications!: SpecificationItemDto[];

  @ApiProperty({
    example:
      'این کرم حاوی ترکیبات مؤثر برای محافظت از پوست شما در برابر آفتاب است...',
    description: 'معرفی کامل محصول',
  })
  @IsString()
  introduce!: string;

  @ApiProperty({
    example: 'روزی دوبار مقدار مناسبی از کرم را روی پوست تمیز استفاده کنید.',
    description: 'نحوه استفاده از محصول',
  })
  @IsString()
  howToUse!: string;

  @ApiProperty({
    example: 'MAY-RIM-waterproof-001',
    description: 'کد SKU یکتا برای هر محصول',
  })
  @IsString()
  sku!: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'موجودی محصول در انبار (در صورت استفاده از مدیریت موجودی)',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @ApiProperty({
    enum: ['simple', 'variant', 'bundle'],
    description: 'نوع محصول: ساده، دارای تنوع (حجمی/وزنی/رنگی) یا پک (باندل)',
    example: 'variant',
  })
  @IsEnum(['simple', 'variant', 'bundle'])
  type!: 'simple' | 'variant' | 'bundle';

  @ApiPropertyOptional({
    type: [CreateVariantDto],
    description:
      'لیست تنوع‌ها (حجمی، وزنی یا رنگی) در صورتی که نوع محصول variant باشد',
  })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return [];
    }
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @ApiPropertyOptional({
    type: [Number],
    description: 'شناسه تگ‌های محصول (از گروه‌های تگ)',
  })
  @Transform(({ value }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed.map((v) => Number(v)) : parsed;
    } catch {
      return [];
    }
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({
    default: 5,
    description: 'وقتی موجودی به این عدد یا کمتر برسد، برچسب «تنها N عدد باقی مانده» نمایش داده می‌شود (۰ = غیرفعال)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isAmazingOffer?: boolean;

  @ApiPropertyOptional({ default: true, description: 'وضعیت موجودی و فعال بودن کالا' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isAvailable?: boolean;

  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return [];
    }
  })
  @IsOptional()
  @IsArray({ message: 'اقلام پک باید به صورت آرایه ارسال شوند.' })
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  bundleItems?: BundleItemDto[];
}
