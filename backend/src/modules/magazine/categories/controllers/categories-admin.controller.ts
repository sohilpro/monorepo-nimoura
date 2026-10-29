import { Body, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos/misc.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator'; // مسیر دکوراتور خودتان

@AdminController('magazine/categories')
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
