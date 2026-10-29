import { Module } from "@nestjs/common";
import { CategoriesModule } from "./categories/categories.module";
import { CommentsModule } from "./comments/comments.module";
import { ArticlesModule } from "./articles/articles.module";
import { AuthorsModule } from "./authors/authors.module";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [ArticlesModule, AuthorsModule, CategoriesModule, TagsModule, CommentsModule],
  exports: [ArticlesModule, AuthorsModule, CategoriesModule, TagsModule, CommentsModule],
})
export class MagazineModule {}