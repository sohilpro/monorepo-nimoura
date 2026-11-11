import {
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Query,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from '../articles.service';
import { createHash } from 'crypto';
import { QueryArticleDto } from '../../dtos/create.dto';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('magazine/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() query: QueryArticleDto) {
    return this.articlesService.findAllPublished(query);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);
    // شمارش بازدید به صورت غیرمسدودکننده
    this.articlesService.incrementView(article.id).catch(() => undefined);
    const related = await this.articlesService.findRelated(article);
    return { article, related };
  }

  @Post(':id/like')
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const fingerprint = createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');
    return this.articlesService.toggleLike(id, fingerprint);
  }
}
