// src/modules/addresses/controllers/addresses.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AddressesService } from '../address.service';
import { CreateAddressDto } from '../dtos/create-address.dto';
import { UpdateAddressDto } from '../dtos/update-address.dto';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';
import { CurrentUser } from 'src/common/auth/auth.decorators';

@ApiTags('Store - Addresses')
@ApiBearerAuth()
@Controller('addresses') // مسیر نهایی: /api/v1/addresses
export class AddressesController {
  constructor(private readonly addressService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'ثبت آدرس جدید برای کاربر جاری' })
  @ApiResponse({ status: 201, description: 'آدرس با موفقیت ثبت شد' })
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateAddressDto,
  ) {
    return await this.addressService.create(dto, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'دریافت لیست آدرس‌های کاربر جاری' })
  @ApiResponse({ status: 200, description: 'لیست آدرس‌های کاربر' })
  async findMy(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.addressService.findMyAddresses(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت جزئیات یک آدرس خاص متعلق به کاربر' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه آدرس' })
  @ApiResponse({ status: 200, description: 'اطلاعات آدرس' })
  @ApiResponse({
    status: 404,
    description: 'آدرس یافت نشد یا متعلق به شما نیست',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.addressService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش آدرس شخصی' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه آدرس' })
  @ApiResponse({ status: 200, description: 'آدرس با موفقیت ویرایش شد' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return await this.addressService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف آدرس شخصی' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه آدرس' })
  @ApiResponse({ status: 200, description: 'آدرس با موفقیت حذف شد' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.addressService.remove(id, userId);
  }
}
