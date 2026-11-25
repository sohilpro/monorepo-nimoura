import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { ShowcaseConfigsService } from '../showcase-configs.service';
import {
  CreateShowcaseConfigDto,
  UpdateShowcaseConfigDto,
} from '../dtos/showcase-config.dto';

@ApiTags('Showcase Configs (Admin)')
@ApiBearerAuth()
@AdminController('showcase-configs')
export class AdminShowcaseConfigsController {
  constructor(private readonly service: ShowcaseConfigsService) {}

  @Get()
  @ApiOperation({ summary: 'لیست تمام ویترینها' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک ویترین' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد ویترین جدید' })
  create(@Body() dto: CreateShowcaseConfigDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ویرایش ویترین' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShowcaseConfigDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف ویترین' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
