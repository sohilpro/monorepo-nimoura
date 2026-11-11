// src/modules/brands/admin-brands.controller.ts
import {
  Param,
  Delete,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateBrandDto } from '../dtos/create-brand.dto';
import { UpdateBrandDto } from '../dtos/update-brand.dto';
import { BrandsService } from '../brands.service';
import { Consumes } from 'src/common/auth/enums/consumes.enum';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import type { ListQuery } from 'src/common/utils/pagination.helper';

@ApiTags('Admin - Brands')
@AdminController('brands')
export class AdminBrandsController {
  constructor(private readonly brandService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'لیست تمام برندها برای مدیریت' })
  @ApiResponse({ status: 200, description: 'لیست برندها دریافت شد' })
  findAll(@Query() query: ListQuery) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت مشخصات یک برند با شناسه' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه برند' })
  @ApiResponse({ status: 200, description: 'اطلاعات برند دریافت شد' })
  @ApiResponse({ status: 404, description: 'برند پیدا نشد' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد برند جدید (مخصوص ادمین)' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 201, description: 'برند با موفقیت ایجاد شد' })
  @ApiResponse({ status: 403, description: 'عدم دسترسی' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش اطلاعات یک برند (مخصوص ادمین)' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه برند' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 200, description: 'برند با موفقیت به‌روزرسانی شد' })
  @ApiResponse({ status: 403, description: 'عدم دسترسی' })
  @ApiResponse({ status: 404, description: 'برند پیدا نشد' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف یک برند (مخصوص ادمین)' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه برند' })
  @ApiResponse({ status: 200, description: 'برند حذف شد' })
  @ApiResponse({ status: 403, description: 'عدم دسترسی' })
  @ApiResponse({ status: 404, description: 'برند پیدا نشد' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }
}
