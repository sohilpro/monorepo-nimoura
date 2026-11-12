import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from './entities/comments.entity';
import { CommentReactions } from './entities/comment-reactions.entity';
import { Products } from '../products/entities/products.entity';
import { Users } from '../users/entities/users.entity';
import { CommentsService } from './comments.service';
import { AdminCommentsController } from './controllers/comments-admin.controller';
import { CommentsController } from './controllers/comments.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comments, CommentReactions, Products, Users]),
    MediaModule,
  ],
  controllers: [AdminCommentsController, CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
