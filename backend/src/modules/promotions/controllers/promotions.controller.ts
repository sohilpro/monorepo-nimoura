// src/modules/promotions/controllers/promotions.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PromotionsService } from '../promotions.service';
import { ApplyDiscountDto } from '../dtos/apply-discount.dto';
import { CurrentUser } from 'src/common/auth/auth.decorators';

@ApiTags('Store - Promotions')
@ApiBearerAuth()
@Controller('promotions') // مسیر نهایی: /api/v1/promotions
export class PromotionsController {
  constructor(private readonly promotionService: PromotionsService) {}

  @Post('apply-discount')
  @ApiOperation({
    summary: 'اعمال کد تخفیف روی سبد خرید',
    description:
      'با ارسال کد تخفیف و اقلام سبد خرید، اعتبارسنجی کد انجام و مبلغ تخفیف محاسبه می‌شود.',
  })
  @ApiResponse({
    status: 200,
    description: 'تخفیف با موفقیت روی سبد خرید اعمال شد.',
  })
  @ApiResponse({
    status: 400,
    description:
      'کد تخفیف نامعتبر است، منقضی شده یا شرط حداقل خرید رعایت نشده است.',
  })
  @ApiResponse({
    status: 401,
    description: 'کاربر احراز هویت نشده است.',
  })
  async applyDiscount(
    @CurrentUser('id') userId: number,
    @Body() dto: ApplyDiscountDto,
  ) {
    return await this.promotionService.applyDiscountToCart(dto, userId);
  }
}
