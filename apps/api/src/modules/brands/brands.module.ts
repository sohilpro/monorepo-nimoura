// src/modules/brands/brands.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brands } from './entities/brands.entity';
import { SubBrands } from './entities/sub-brands.entity';
import { BrandsController } from './controllers/brands.controller';
import { BrandsService } from './brands.service';
import { Products } from '../products/entities/products.entity';
import { AdminBrandsController } from './controllers/brands-admin.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brands, SubBrands, Products]),
    MediaModule,
  ],
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService],
  exports: [BrandsService, TypeOrmModule], // اکسپورت برای استفاده در ماژول محصولات
})
export class BrandsModule {}
