// src/modules/categories/controllers/admin-category.controller.ts
import {
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CategoryService } from '../categories.service';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import type { ListQuery } from 'src/common/utils/pagination.helper';

@AdminController('categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد دسته‌بندی جدید' })
  @ApiResponse({
    status: 201,
    description: 'دسته‌بندی با موفقیت ایجاد شد',
  })
  async create(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت همه دسته‌بندی‌ها' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام دسته‌بندی‌ها با روابط آن‌ها',
  })
  async findAll(@Query() query: ListQuery) {
    return await this.categoryService.findAll(query);
  }

  @Get('tree-with-products')
  @ApiOperation({ summary: 'دریافت درخت دسته‌بندی به‌همراه محصولات' })
  @ApiResponse({
    status: 200,
    description: 'ساختار درختی دسته‌ها با محصولات هر دسته',
  })
  async getTreeWithProducts() {
    return await this.categoryService.getCategoryTreeWithProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک دسته‌بندی با شناسه' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات یک دسته‌بندی خاص',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش یک دسته‌بندی' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'دسته‌بندی با موفقیت ویرایش شد',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف یک دسته‌بندی' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'دسته‌بندی با موفقیت حذف شد',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.remove(id);
  }
}
