import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { CommentStatus } from '../../entities/comment.entity';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@AdminController('magazine/comments')
export class CommentsAdminController {
  constructor(private readonly commentsService: CommentsService) {}

  // دریافت لیست نظرات با فیلتر وضعیت و صفحه‌بندی
  @Get()
  findAllAdmin(
    @Query('status') status?: CommentStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findAllAdmin({
      status,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get('pending')
  findPending() {
    return this.commentsService.findPendingAdmin();
  }

  @Patch(':id/status')
  moderate(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: CommentStatus,
  ) {
    return this.commentsService.moderate(id, status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }
}
