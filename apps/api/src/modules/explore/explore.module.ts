import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExploreVideo } from './entities/explore-video.entity';
import { ExploreVideoComment } from './entities/explore-video-comment.entity';
import { ExploreVideoLike } from './entities/explore-video-like.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExploreVideo,
      ExploreVideoComment,
      ExploreVideoLike,
      Categories,
    ]),
  ],
  controllers: [ExploreController],
  providers: [ExploreService],
  exports: [ExploreService],
})
export class ExploreModule {}
