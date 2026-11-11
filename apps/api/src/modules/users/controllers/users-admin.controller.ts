import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { UsersService } from '../user.service';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';
import { Consumes } from 'src/common/auth/enums/consumes.enum';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Post } from '@nestjs/common';

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
    description: 'امکان جستجو، فیلتر و صفحه‌بندی کاربران سیستم.',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست کاربران با موفقیت دریافت شد.',
  })
  @ApiResponse({
    status: 403,
    description: 'عدم دسترسی (فقط ادمین و مالک).',
  })
  getUsers(@Query() query: PaginationQueryDto) {
    return this.userService.getUsers(query);
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
    description: 'حذف نرم (Soft Delete) یا فیزیکی کاربر از سیستم.',
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
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
