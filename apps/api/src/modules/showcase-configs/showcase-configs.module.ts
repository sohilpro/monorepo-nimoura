import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowcaseConfig } from './entities/showcase-config.entity';
import { ShowcaseConfigsService } from './showcase-configs.service';
import { AdminShowcaseConfigsController } from './controllers/showcase-configs-admin.controller';
import { ShowcaseConfigsController } from './controllers/showcase-configs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShowcaseConfig])],
  controllers: [AdminShowcaseConfigsController, ShowcaseConfigsController],
  providers: [ShowcaseConfigsService],
  exports: [ShowcaseConfigsService],
})
export class ShowcaseConfigsModule {}
