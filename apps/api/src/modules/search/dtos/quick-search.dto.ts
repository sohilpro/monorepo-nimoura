import { IsString, MinLength } from 'class-validator';

export class QuickSearchDto {
  @IsString()
  @MinLength(1, { message: 'عبارت جستجو نمی‌تواند خالی باشد' })
  q!: string;
}
