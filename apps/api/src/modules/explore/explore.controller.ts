import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import { ExploreService } from './explore.service';
import { QueryExploreDto } from './dtos/query-explore.dto';
import { CreateExploreCommentDto } from './dtos/create-explore-comment.dto';

@ApiTags('Explore / Video Feed')
@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Public()
  @Get('videos')
  @ApiOperation({ summary: 'دریافت ویدیوهای اکسپلور همراه با صفحه‌بندی نشانگر (Cursor)' })
  async getVideos(
    @Query() query: QueryExploreDto,
    @CurrentUser('id') userId?: number,
  ) {
    return await this.exploreService.getVideos(query, userId);
  }

  @Public()
  @Get('videos/categories')
  @ApiOperation({ summary: 'دریافت دسته‌بندی‌های اکسپلور' })
  async getCategoriesForVideos() {
    return await this.exploreService.getCategories();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'دریافت دسته‌بندی‌های اکسپلور (آدرس مستقیم)' })
  async getCategories() {
    return await this.exploreService.getCategories();
  }

  @Public()
  @Get('videos/:id/comments')
  @ApiOperation({ summary: 'دریافت نظرات یک ویدیو' })
  async getComments(
    @Param('id', ParseIntPipe) videoId: number,
    @Query('cursor') cursor?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.exploreService.getComments(videoId, cursor, limit);
  }

  @ApiBearerAuth()
  @Post('videos/:id/comments')
  @ApiOperation({ summary: 'ثبت نظر جدید روی ویدیو' })
  async addComment(
    @Param('id', ParseIntPipe) videoId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: CreateExploreCommentDto,
  ) {
    return await this.exploreService.addComment(videoId, userId, dto.text);
  }

  @Public()
  @Post('videos/:id/like')
  @ApiOperation({ summary: 'لایک یا دیس‌لایک ویدیو' })
  async toggleLike(
    @Param('id', ParseIntPipe) videoId: number,
    @CurrentUser('id') userId?: number,
    @Ip() ip?: string,
  ) {
    return await this.exploreService.toggleLike(videoId, userId, ip);
  }

  @Public()
  @Post('videos/:id/view')
  @ApiOperation({ summary: 'ثبت بازدید ویدیو' })
  async incrementView(@Param('id', ParseIntPipe) videoId: number) {
    return await this.exploreService.incrementView(videoId);
  }
}
