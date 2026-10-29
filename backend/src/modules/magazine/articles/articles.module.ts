import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './controllers/articles.controller';
import { Article } from '../entities/articles.entity';
import { ArticleLike } from '../entities/article-like.entity';
import { Category } from '../entities/category.entity';
import { Author } from '../entities/author.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';
import { ArticlesAdminController } from './controllers/articles-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleLike,
      Category,
      Author,
      Tag,
      Comment,
    ]),
  ],
  controllers: [ArticlesController, ArticlesAdminController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
