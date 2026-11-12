// src/modules/brands/brands.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { BrandsService } from '../brands.service';
import { Public } from 'src/common/auth/auth.decorators';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';

@ApiTags('Brands (Public)')
@Public()
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandService: BrandsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست برندها' })
  @ApiResponse({ status: 200, description: 'لیست برندها دریافت شد' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.brandService.findAll(query);
  }

  @Public()
  @Get(':identifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات یک برند با شناسه یا اسلاگ' })
  @ApiParam({
    name: 'identifier',
    type: String,
    description: 'شناسه عددی یا اسلاگ برند',
  })
  @ApiResponse({ status: 200, description: 'اطلاعات برند دریافت شد' })
  @ApiResponse({ status: 404, description: 'برند پیدا نشد' })
  findOne(@Param('identifier') identifier: string) {
    return this.brandService.findByIdentifier(identifier);
  }
}
