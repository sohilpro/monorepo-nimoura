// src/modules/brands/brands.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner, BannerPosition } from './entities';
import { BannersController } from './controllers/banners.controller';
import { AdminBannersController } from './controllers/banners-admin.controller';
import { BannersService } from './banners.service';
import { BannerPositionController } from './controllers/banner-position.controller';
import { BannerPositionService } from './banner-position.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, BannerPosition]), MediaModule],
  controllers: [
    BannersController,
    AdminBannersController,
    BannerPositionController,
  ],
  providers: [BannersService, BannerPositionService],
  exports: [BannersService, TypeOrmModule, BannerPositionService],
})
export class BannersModule {}
