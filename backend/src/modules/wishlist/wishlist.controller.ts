import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from 'src/common/auth/auth.decorators';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({
    summary: 'دریافت لیست علاقه‌مندی‌های کاربر',
    description:
      'تمام محصولاتی که کاربر به لیست علاقه‌مندی خود اضافه کرده را برمی‌گرداند.',
  })
  @ApiResponse({ status: 200, description: 'لیست با موفقیت دریافت شد.' })
  getWishlist(@CurrentUser('id') userId: number) {
    return this.wishlistService.getUserWishlist(userId);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'بررسی وجود یک محصول در علاقه‌مندی‌ها',
    description:
      'برای نمایش وضعیت فعال/غیرفعال آیکون قلب در صفحه‌ی محصول استفاده می‌شود.',
  })
  checkWishlist(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.isInWishlist(userId, productId);
  }

  @Post('toggle/:productId')
  @ApiOperation({
    summary: 'افزودن یا حذف محصول از علاقه‌مندی‌ها (toggle)',
    description:
      'اگر محصول در لیست باشد حذف می‌شود، در غیر این صورت اضافه می‌شود.',
  })
  @ApiResponse({ status: 200, description: 'عملیات با موفقیت انجام شد.' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد.' })
  toggleWishlist(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.toggle(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'حذف محصول از علاقه‌مندی‌ها',
  })
  @ApiResponse({ status: 200, description: 'با موفقیت حذف شد.' })
  @ApiResponse({
    status: 404,
    description: 'این محصول در لیست علاقه‌مندی‌ها نیست.',
  })
  removeFromWishlist(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.remove(userId, productId);
  }
}
