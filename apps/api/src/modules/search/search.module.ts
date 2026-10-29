import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Brands } from '../brands/entities/brands.entity';
import { Categories } from '../categories/entities/categories.entity';
import { Products } from '../products/entities/products.entity';
import { SubBrands } from '../brands/entities/sub-brands.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Products, Categories, Brands, SubBrands]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
