// src/modules/addresses/controllers/admin-addresses.controller.ts
import {
  Get,
  Param,
  Query,
  Delete,
  Patch,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AddressesService } from '../address.service';
import { UpdateAddressDto } from '../dtos/update-address.dto';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@AdminController('addresses') // مسیر نهایی: /api/v1/admin/addresses
export class AdminAddressesController {
  constructor(private readonly addressService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت لیست تمام آدرس‌ها با صفحه‌بندی (ادمین)' })
  @ApiResponse({ status: 200, description: 'لیست آدرس‌ها' })
  async findAll(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return await this.addressService.findAllPaginated(page, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'دریافت آدرس‌های یک کاربر خاص توسط ادمین' })
  @ApiParam({ name: 'userId', type: Number, description: 'شناسه کاربر' })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.addressService.findMyAddresses(userId, query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش آدرس توسط ادمین' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه آدرس' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return await this.addressService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف آدرس توسط ادمین' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه آدرس' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.addressService.adminDelete(id);
  }
}
