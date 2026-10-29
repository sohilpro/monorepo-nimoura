import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/modules/products/entities/products.entity';
import { Brands } from 'src/modules/brands/entities/brands.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { PriceListController } from './price-list.controller';
import { PriceListService } from './price-list.service';

@Module({
  imports: [TypeOrmModule.forFeature([Products, Brands, Categories])],
  controllers: [PriceListController],
  providers: [PriceListService],
})
export class PriceListModule {}