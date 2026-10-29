import { IsInt, IsOptional, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class BundleItemDto {
  @Type(() => Number)
  @IsInt({ message: 'شناسه محصول باید یک عدد صحیح باشد.' })
  @IsPositive({ message: 'شناسه محصول معتبر نیست.' })
  productId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'شناسه واریانت باید یک عدد صحیح باشد.' })
  @IsPositive({ message: 'شناسه واریانت معتبر نیست.' })
  variantId?: number;

  @Type(() => Number)
  @IsInt({ message: 'تعداد باید یک عدد صحیح باشد.' })
  @Min(1, { message: 'تعداد هر قلم در پک حداقل باید ۱ عدد باشد.' })
  quantity!: number;
}
