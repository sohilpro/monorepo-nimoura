// src/modules/comments/controllers/comments.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';
import type { JwtPayload } from 'src/common/auth/jwt.types';

@ApiTags('Store - Comments')
@Controller('comments') // مسیر نهایی: /api/v1/comments
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'ثبت نظر جدید توسط کاربر',
    description: 'کاربر لاگین‌کرده می‌تواند برای یک محصول دیدگاه ثبت کند.',
  })
  @ApiResponse({ status: 201, description: 'کامنت با موفقیت ثبت شد.' })
  @ApiResponse({ status: 400, description: 'اطلاعات ارسال‌شده معتبر نیست.' })
  @ApiResponse({ status: 401, description: 'ابتدا وارد حساب کاربری خود شوید.' })
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentsService.create(dto, userId);
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({
    summary: 'دریافت نظرات تاییدشده یک محصول',
    description:
      'مشاهده لیست تمام نظرات فعال و تاییدشده برای یک محصول با صفحه‌بندی.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'شناسه محصول',
    example: 42,
  })
  @ApiResponse({ status: 200, description: 'لیست نظرات محصول بازگردانده شد.' })
  async findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: PaginationQueryDto,
    @Req() req: Request,
  ) {
    let userId: number | undefined;
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        userId = payload.sub;
      } catch {
        // invalid or expired optional token — serve public view
      }
    }

    return await this.commentsService.findByProduct(productId, query, userId);
  }

  @ApiBearerAuth()
  @Post(':id/like')
  @ApiOperation({
    summary: 'لایک کردن یک دیدگاه',
    description: 'ثبت واکنش مثبت (Like) روی دیدگاه توسط کاربر جاری.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه کامنت',
    example: 17,
  })
  @ApiResponse({ status: 200, description: 'دیدگاه با موفقیت لایک شد.' })
  async like(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.commentsService.react(id, userId, 'like');
  }

  @ApiBearerAuth()
  @Post(':id/dislike')
  @ApiOperation({
    summary: 'دیس‌لایک کردن یک دیدگاه',
    description: 'ثبت واکنش منفی (Dislike) روی دیدگاه توسط کاربر جاری.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه کامنت',
    example: 17,
  })
  @ApiResponse({ status: 200, description: 'دیدگاه با موفقیت دیس‌لایک شد.' })
  async disLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.commentsService.react(id, userId, 'dislike');
  }
}
