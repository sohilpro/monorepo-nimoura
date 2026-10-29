import {
  Body,
  Controller,
  Get,
  Ip,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../../dtos/misc.dto';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('magazine/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // دریافت نظرات تایید شده یک مقاله
  @Get()
  findByArticle(@Query('articleId', ParseIntPipe) articleId: number) {
    return this.commentsService.findApprovedByArticle(articleId);
  }

  // ثبت نظر جدید توسط کاربر عادی
  @Post()
  create(@Body() dto: CreateCommentDto, @Ip() ip: string) {
    return this.commentsService.create(dto, ip);
  }
}
