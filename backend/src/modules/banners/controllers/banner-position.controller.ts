import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannerPositionService } from '../banner-position.service';
import { CreatePositionDto, UpdatePositionDto } from '../dtos';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@ApiTags('Banner Positions (Admin)')
@ApiBearerAuth()
@AdminController('banner-positions')
export class BannerPositionController {
  constructor(private readonly positionService: BannerPositionService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد جایگاه جدید نمایش بنر' })
  create(@Body() dto: CreatePositionDto) {
    return this.positionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'لیست همه‌ی جایگاه‌ها' })
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.positionService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.remove(id);
  }
}
