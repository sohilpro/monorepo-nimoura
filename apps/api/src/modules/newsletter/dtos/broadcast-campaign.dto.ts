import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class BroadcastCampaignDto {
  @ApiProperty({ description: 'کد تخفیف ارسالی برای اعضا', example: 'OFFER50' })
  @IsString({ message: 'کد تخفیف باید متنی باشد' })
  @IsNotEmpty({ message: 'کد تخفیف یا توکن الزامی است' })
  @MaxLength(50)
  promoCode!: string;

  @ApiPropertyOptional({ description: 'عنوان یا پیام کوتاه برای لاگ ادمین' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
