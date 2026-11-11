// src/modules/categories/controllers/category.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/auth/auth.decorators';
import { CategoryService } from '../categories.service';

@ApiTags('Store - Categories')
@Public() // دسترسی آزاد و بدون نیاز به توکن برای عموم کاربران
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('tree')
  @ApiOperation({ summary: 'دریافت درخت دسته‌بندی به‌همراه محصولات' })
  @ApiResponse({
    status: 200,
    description: 'ساختار درختی دسته‌ها با محصولات هر دسته',
  })
  async getTreeWith() {
    return await this.categoryService.getCategoryTree();
  }

  @Get()
  @ApiOperation({ summary: 'دریافت همه دسته‌بندی‌ها' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام دسته‌بندی‌ها با روابط آن‌ها',
  })
  async findAll(@Query() query: any) {
    return await this.categoryService.findAll(query);
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
}
