import {
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from '../banners.service';
import {
  CreateBannerDto,
  UpdateBannerDto,
  QueryBannerDto,
  ReorderBannerDto,
} from '../dtos';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

/**
 * روت‌های مدیریتی (پنل ادمین) - نیاز به احراز هویت دارند.
 * پیشوند مسیر: /admin/banners
 */
@ApiTags('Banners (Admin)')
@ApiBearerAuth()
@AdminController('banners')
export class AdminBannersController {
  constructor(private readonly bannerService: BannersService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد بنر جدید' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'لیست بنرها با فیلتر، جستجو و صفحه‌بندی' })
  findAll(@Query() query: QueryBannerDto) {
    return this.bannerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک بنر' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ویرایش کامل/جزئی بنر' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(id, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'تغییر ترتیب چند بنر هم‌زمان (drag & drop)' })
  reorder(@Body() dto: ReorderBannerDto) {
    return this.bannerService.reorder(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تغییر سریع وضعیت بنر (فعال/غیرفعال)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: UpdateBannerDto['status'],
  ) {
    return this.bannerService.update(id, { status });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف نرم بنر (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'بازگردانی بنر حذف‌شده' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.restore(id);
  }
}
