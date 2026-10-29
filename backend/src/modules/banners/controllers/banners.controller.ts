import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BannersService } from '../banners.service';
import { BannerDevice } from '../enums';
import { Public } from 'src/common/auth/auth.decorators';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

/**
 * روت‌های عمومی (بدون نیاز به لاگین) - مناسب فرانت‌اند برای دریافت بنرها و ثبت آمار
 * پیشوند مسیر: /banners
 */
@ApiTags('Banners (Public)')
@Public()
@UseGuards(ThrottlerGuard)
@Controller('banners')
export class BannersController {
  constructor(private readonly bannerService: BannersService) {}

  @Get('position/:positionKey')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15 * 1000) // ۶۰ ثانیه در حافظه RAM کش می‌ماند (در nestjs/cache-manager مقیاس میلی‌ثانیه است)
  @ApiOperation({ summary: 'دریافت بنرهای فعال یک جایگاه برای نمایش در سایت' })
  findActive(
    @Param('positionKey') positionKey: string,
    @Query('device') device: BannerDevice = BannerDevice.ALL,
  ) {
    return this.bannerService.findActiveForPosition(positionKey, device);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'ثبت یک بازدید (impression) برای بنر' })
  trackView(@Param('id') id: number) {
    return this.bannerService.incrementView(id);
  }

  @Post(':id/click')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'ثبت یک کلیک برای بنر' })
  trackClick(@Param('id') id: number) {
    return this.bannerService.incrementClick(id);
  }
}
