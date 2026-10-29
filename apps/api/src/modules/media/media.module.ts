import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
// import { MediaService } from './media.service';
import { FtpService } from './ftp.service';
import { ImageOptimizerService } from './image-optimizer.service';
import { MediaAdminController } from './controllers/media-admin.controller';
import { MediaPublicController } from './controllers/media.controller';
import { MediaStaticService } from './media-static.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  controllers: [MediaPublicController, MediaAdminController],
  providers: [FtpService, ImageOptimizerService, MediaStaticService],
  exports: [MediaStaticService], // برای استفاده در ProductService, BrandService و غیره
  // exports: [MediaService], // برای استفاده در ProductService, BrandService و غیره
})
export class MediaModule {}