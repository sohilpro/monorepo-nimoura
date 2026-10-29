import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/common/auth/auth.decorators';
import { UserRole } from 'src/common/auth/jwt.types';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@ApiTags('Admin - Comments')
@AdminController('comments')
export class AdminCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({
    summary: 'ایجاد کامنت جدید',
    description: 'کامنتی توسط ادمین یا سیستم ایجاد می‌شود.',
  })
  @ApiResponse({ status: 201, description: 'کامنت با موفقیت ایجاد شد.' })
  async create(@Body() dto: CreateCommentDto) {
    return await this.commentsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'دریافت لیست همه نظرات',
    description: 'نمایش تمام کامنت‌های ثبت‌شده در سیستم.',
  })
  @ApiResponse({ status: 200, description: 'لیست نظرات با موفقیت دریافت شد.' })
  async findAll(@Query() query: any) {
    return await this.commentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'دریافت جزئیات یک نظر',
    description: 'دریافت اطلاعات یک کامنت با استفاده از شناسه آن.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه کامنت',
    example: 42,
  })
  @ApiResponse({ status: 200, description: 'اطلاعات نظر بازگردانده شد.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'ویرایش یک نظر',
    description: 'ویرایش اطلاعات کامنت ثبت‌شده توسط ادمین.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه کامنت' })
  @ApiResponse({ status: 200, description: 'کامنت با موفقیت ویرایش شد.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف کامنت',
    description: 'حذف منطقی کامنت (عدم نمایش به کاربران).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه کامنت' })
  @ApiResponse({ status: 200, description: 'کامنت با موفقیت حذف شد.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.remove(id);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'تأیید کامنت',
    description: 'تغییر وضعیت کامنت به تایید شده (توسط ادمین).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه کامنت' })
  @ApiResponse({ status: 200, description: 'کامنت با موفقیت تایید شد.' })
  async approve(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'رد کامنت',
    description: 'تغییر وضعیت کامنت به رد شده.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه کامنت' })
  @ApiResponse({ status: 200, description: 'کامنت با موفقیت رد شد.' })
  async reject(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.reject(id);
  }
}