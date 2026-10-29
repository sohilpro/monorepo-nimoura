// src/modules/cart/controllers/cart.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService, PriceValidationDetail } from './cart.service';
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import { CartDto, RemoveCartItemDto } from './dtos/cart.dto';
import { ValidatePriceDto } from './dtos/validatePrice.dto';
import { SyncCartDto } from './dtos/sync-cart.dto';

@ApiTags('Store - Cart')
@ApiBearerAuth()
@Controller('cart') // مسیر نهایی: /api/v1/cart
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'دریافت سبد خرید کاربر',
    description:
      'نمایش اقلام سبد خرید کاربر لاگین‌کرده به همراه قیمت‌ها و جمع کل.',
  })
  @ApiResponse({ status: 200, description: 'سبد خرید با موفقیت دریافت شد.' })
  async getCart(@CurrentUser('id') userId: number) {
    return await this.cartService.getCartByUser(userId);
  }

  @Post('add')
  @ApiOperation({
    summary: 'افزودن محصول یا واریانت به سبد خرید',
    description:
      'افزودن یک آیتم با تعداد مشخص به سبد کاربر و بازگرداندن سبد کامل.',
  })
  @ApiResponse({ status: 201, description: 'محصول با موفقیت به سبد اضافه شد.' })
  async addToCart(@CurrentUser('id') userId: number, @Body() body: CartDto) {
    const variantId = body.variant ?? body.variantId ?? null;

    await this.cartService.addItemToCart(
      userId,
      body.productId,
      body.quantity,
      variantId,
    );

    // بازگرداندن سبد خرید کامل به‌روزرسانی شده به همراه قیمت‌ها
    return await this.cartService.getCartByUser(userId);
  }

  @Patch('update')
  @ApiOperation({
    summary: 'به‌‌روزرسانی تعداد آیتم در سبد',
    description: 'تغییر تعداد یک آیتم و محاسبه مجدد قیمت‌های عمده کل سبد.',
  })
  @ApiResponse({
    status: 200,
    description: 'تعداد آیتم به‌روزرسانی و سبد جدید بازگردانده شد.',
  })
  async updateQuantity(
    @CurrentUser('id') userId: number,
    @Body() body: CartDto,
  ) {
    const variantId = body.variant ?? body.variantId ?? null;

    await this.cartService.updateQuantity(
      userId,
      body.productId,
      body.quantity,
      variantId,
    );

    return await this.cartService.getCartByUser(userId);
  }

  @Delete('remove/:productId')
  @ApiOperation({
    summary: 'حذف یک محصول از سبد خرید',
    description: 'حذف یک قلم کالا بر اساس شناسه محصول و شناسه واریانت.',
  })
  @ApiParam({ name: 'productId', type: Number, description: 'شناسه محصول' })
  @ApiResponse({ status: 200, description: 'آیتم از سبد خرید حذف شد.' })
  async remove(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('variantId') queryVariantId?: number,
    @Body() body?: RemoveCartItemDto,
  ) {
    // اولویت‌بندی خواندن variantId:
    // ۱. از کوئری استرینگ URL (?variantId=55)
    // ۲. از داخل فیلد variant بادی ({ variant: { id: 55 } })
    // ۳. از داخل فیلد variantId بادی ({ variantId: 55 })
    const targetVariantId = queryVariantId
      ? Number(queryVariantId)
      : (body?.variant ?? body?.variantId ?? null);

    return await this.cartService.removeItem(
      userId,
      productId,
      targetVariantId,
    );
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'پاک‌سازی کامل سبد خرید',
    description: 'تمام اقلام سبد کاربر جاری حذف می‌شوند.',
  })
  @ApiResponse({ status: 200, description: 'سبد خرید با موفقیت تخلیه شد.' })
  async clear(@CurrentUser('id') userId: number) {
    return await this.cartService.clearCart(userId);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'همگام‌سازی سبد لوکال کاربر با سرور (پس از لاگین)',
    description:
      'انتقال آیتم‌های سبد خرید ذخیره‌شده در LocalStorage فرانت‌اند به دیتابیس سرور.',
  })
  @ApiResponse({
    status: 200,
    description: 'همگام‌سازی سبد با موفقیت انجام شد.',
  })
  async syncCart(@CurrentUser('id') userId: number, @Body() dto: SyncCartDto) {
    return await this.cartService.syncCart(userId, dto);
  }

  @Public() // دسترسی آزاد بدون نیاز به لاگین برای اعتبارسنجی قیمت‌های سبد مهمان
  @Post('validate')
  @ApiOperation({
    summary: 'اعتبارسنجی قیمت‌های لحظه‌ای اقلام سبد',
    description:
      'بررسی عدم تغییر قیمت و اطمینان از موجودی کالاها پیش از ثبت نهایی سفارش.',
  })
  @ApiResponse({
    status: 200,
    description: 'قیمت‌ها و موجودی کالاها با موفقیت بررسی شد.',
  })
  async validateCartPrices(@Body() dto: ValidatePriceDto): Promise<{
    pricesChanged: boolean;
    details: PriceValidationDetail[];
  }> {
    return await this.cartService.validateCartPrices(dto.items);
  }
}
