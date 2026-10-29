import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from '../categories.service';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('magazine/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
