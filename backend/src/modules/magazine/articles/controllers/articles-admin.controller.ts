import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from '../articles.service';
import {
  CreateArticleDto,
  QueryArticleAdminDto,
  UpdateArticleDto,
} from '../../dtos/create.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@AdminController('magazine/articles')
export class ArticlesAdminController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('list')
  findAllAdmin(@Query() query: QueryArticleAdminDto) {
    return this.articlesService.findAllAdmin(query);
  }

  @Get(':id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
