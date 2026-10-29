import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotions } from './entities/promotion.entity';
import { PromotionUsages } from './entities/promotion-usages.entity';
import { PromotionsController } from './controllers/promotions.controller';
import { AdminPromotionsController } from './controllers/promotions-admin.controller';
import { PromotionsService } from './promotions.service';
import { Products } from '../products/entities/products.entity';
import { Categories } from '../categories/entities/categories.entity';
import { Brands } from '../brands/entities/brands.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotions, PromotionUsages, Products,Categories,Brands])],
  controllers: [PromotionsController, AdminPromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionModule {}
