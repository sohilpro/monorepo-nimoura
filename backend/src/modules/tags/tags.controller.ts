import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { BulkCreateTagsDto } from './dtos/bulk-create-tags.dto';
import { ListTagsQueryDto } from './dtos/list-tags.dto';
import { SuggestQueryDto } from './dtos/suggest.dto';
import { Public, Roles } from 'src/common/auth/auth.decorators';
import { Consumes } from 'src/common/auth/enums/consumes.enum';
import { UserRole } from 'src/common/auth/jwt.types';

@ApiTags('Tags')
@Controller(['tags', 'admin/tags'])
export class TagsController {
  constructor(private readonly service: TagsService) {}

  // ==========================================
  // روت‌های عمومی و خواندنی (Store & Admin)
  // ==========================================

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لیست، جستجو و فیلتر تگ‌ها' })
  @ApiResponse({ status: 200, description: 'لیست تگ‌ها با موفقیت دریافت شد' })
  list(@Query() qs: ListTagsQueryDto) {
    return this.service.list(qs);
  }

  @Public()
  @Get('suggest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'پیشنهاد خودکار مقدار برای نوع تگ (AutoComplete)' })
  @ApiResponse({ status: 200, description: 'پیشنهادات دریافت شد' })
  suggest(@Query() qs: SuggestQueryDto) {
    return this.service.suggest(qs);
  }

  @Public()
  @Get('filters')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'دریافت تگ‌ها به‌صورت گروه‌بندی‌شده برای فیلترها و فرم محصول',
  })
  @ApiResponse({ status: 200, description: 'تگ‌های دسته‌بندی‌شده دریافت شد' })
  grouped() {
    return this.service.grouped();
  }

  @Public()
  @Get('types-label')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لیست تایپ‌های مجاز همراه با لیبل فارسی برای UI' })
  @ApiResponse({ status: 200, description: 'لیست تایپ‌های مجاز دریافت شد' })
  getTypesLabel() {
    return this.service.getAllowedTypesLabeled();
  }

  @Public()
  @Get('types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لیست تایپ‌های مجاز تگ‌ها' })
  @ApiResponse({ status: 200, description: 'تایپ‌ها دریافت شد' })
  getTypes() {
    return this.service.getAllowedTypes();
  }

  // ==========================================
  // روت‌های ایجاد و تغییرات (مخصوص ادمین)
  // ==========================================

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد یک تگ جدید (ادمین)' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 201, description: 'تگ با موفقیت ایجاد شد' })
  @ApiResponse({ status: 403, description: 'عدم دسترسی' })
  createOne(@Body() dto: CreateTagDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد دسته‌ای یا آپ‌سرت تگ‌ها (ادمین)' })
  @ApiConsumes(Consumes.Json)
  @ApiResponse({ status: 201, description: 'تگ‌ها با موفقیت ثبت شدند' })
  @ApiResponse({ status: 403, description: 'عدم دسترسی' })
  createBulk(@Body() dto: BulkCreateTagsDto) {
    return this.service.createBulk(dto);
  }
}
