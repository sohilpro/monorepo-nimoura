import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import type { AuthenticatedUser } from 'src/common/auth/jwt.types';
import { Consumes } from 'src/common/auth/enums/consumes.enum';
import { UsersService } from '../user.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AdminUsersQueryDto } from '../dtos/admin-users-query.dto';
import { BulkDeleteUsersDto } from '../dtos/bulk-delete-users.dto';

@AdminController('users')
export class UsersAdminController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'ایجاد کاربر / مشتری جدید (ادمین)',
  })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({
    status: 201,
    description: 'کاربر با موفقیت ایجاد شد.',
  })
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'دریافت لیست کاربران (ادمین)',
    description: 'امکان جستجو، فیلتر نقش/تأیید و صفحه‌بندی کاربران سیستم.',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست کاربران با موفقیت دریافت شد.',
  })
  @ApiResponse({
    status: 403,
    description: 'عدم دسترسی (فقط ادمین و مالک).',
  })
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.userService.getUsers(query);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف گروهی کاربران انتخاب‌شده (ادمین)' })
  bulkDeleteUsers(
    @Body() dto: BulkDeleteUsersDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.userService.bulkDeleteUsers(dto.ids, actor?.id);
  }

  @Get(':id/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت آمار سفارش، آدرس و دیدگاه یک کاربر' })
  @ApiParam({ name: 'id', type: Number })
  getUserStats(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserStats(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'دریافت جزئیات یک کاربر با شناسه',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه عددی کاربر',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات کاربر با موفقیت بازگردانده شد.',
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر مورد نظر یافت نشد.',
  })
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ویرایش اطلاعات کاربر توسط ادمین',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه عددی کاربر',
    example: 1,
  })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({
    status: 200,
    description: 'اطلاعات کاربر با موفقیت ویرایش شد.',
  })
  @ApiResponse({
    status: 400,
    description: 'اطلاعات ارسالی نامعتبر است.',
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر پیدا نشد.',
  })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'حذف کاربر',
    description: 'حذف یا بایگانی امن کاربر از سیستم.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه کاربر جهت حذف',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'کاربر با موفقیت حذف شد.',
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر پیدا نشد.',
  })
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.userService.deleteUser(id, actor?.id);
  }
}
