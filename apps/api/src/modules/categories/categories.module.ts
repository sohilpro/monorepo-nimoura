import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/modules/products/entities/products.entity';
import { Categories } from './entities/categories.entity';
import { CategoryService } from './categories.service';
import { AdminCategoryController } from './controllers/category-admin.controller';
import { CategoryController } from './controllers/category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Categories, Products])],
  controllers: [AdminCategoryController, CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoriesModule {}
