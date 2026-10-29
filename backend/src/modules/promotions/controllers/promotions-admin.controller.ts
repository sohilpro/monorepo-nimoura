// src/modules/promotions/controllers/admin-promotions.controller.ts
import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PromotionsService } from '../promotions.service';
import { CreatePromotionDto } from '../dtos/create-promotion.dto';
import { UpdatePromotionDto } from '../dtos/update-promotion.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';

@AdminController('promotions') // مسیر نهایی: /api/v1/admin/promotions
export class AdminPromotionsController {
  constructor(private readonly promotionService: PromotionsService) {}

  @Post()
  @ApiOperation({
    summary: 'ایجاد تخفیف یا کد تخفیف جدید توسط ادمین',
    description: 'ثبت کد تخفیف جدید برای محصولات، دسته‌بندی‌ها یا کل سفارش.',
  })
  @ApiResponse({ status: 201, description: 'تخفیف با موفقیت ایجاد شد.' })
  async create(@Body() dto: CreatePromotionDto) {
    return await this.promotionService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'دریافت لیست تمام تخفیف‌ها با صفحه‌بندی',
    description: 'نمایش لیست همه تخفیف‌های فعال، غیرفعال و منقضی‌شده.',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست تخفیف‌ها با موفقیت دریافت شد.',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.promotionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'دریافت جزئیات یک تخفیف خاص',
    description: 'مشاهده کامل مشخصات، محدودیت‌ها و شرایط استفاده از تخفیف.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه تخفیف',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'اطلاعات تخفیف بازگردانده شد.' })
  @ApiResponse({ status: 404, description: 'تخفیف یافت نشد.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.promotionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'ویرایش اطلاعات تخفیف',
    description: 'به‌روزرسانی درصد/مبلغ تخفیف، تاریخ انقضا و سقف استفاده.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه تخفیف جهت ویرایش',
  })
  @ApiResponse({ status: 200, description: 'تخفیف با موفقیت به‌روزرسانی شد.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ) {
    return await this.promotionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف یا غیرفعال‌سازی تخفیف',
    description: 'حذف نرم (Soft Delete) تخفیف از سیستم.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه تخفیف جهت حذف',
  })
  @ApiResponse({ status: 200, description: 'تخفیف با موفقیت حذف شد.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.promotionService.remove(id);
  }
}
