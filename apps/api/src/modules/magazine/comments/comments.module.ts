import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './controllers/comments.controller';
import { Comment } from '../entities/comment.entity';
import { Article } from '../entities/articles.entity';
import { CommentsAdminController } from './controllers/comments-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Article])],
  controllers: [CommentsController, CommentsAdminController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
