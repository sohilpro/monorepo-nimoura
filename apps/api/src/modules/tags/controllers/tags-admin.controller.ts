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
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { TagGroupsService } from '../services/tag-groups.service';
import { TagsService } from '../services/tags.service';
import {
  CreateTagGroupDto,
  ReorderDto,
  UpdateTagGroupDto,
} from '../dtos/tag-group.dto';
import {
  BulkCreateTagsDto,
  CreateTagDto,
  ListTagsQueryDto,
  MergeTagsDto,
  UpdateTagDto,
} from '../dtos/tag.dto';

@AdminController('tags')
export class TagsAdminController {
  constructor(
    private readonly groups: TagGroupsService,
    private readonly tags: TagsService,
  ) {}

  /* ------------------------------- groups -------------------------------- */

  @Get('groups')
  @ApiOperation({ summary: 'لیست گروه‌های تگ (با تعداد تگ یا تگ‌های هر گروه)' })
  listGroups(
    @Query('includeTags') includeTags?: string,
    @Query('includeEmpty') includeEmpty?: string,
  ) {
    const isTrue = (v?: string) => v === 'true' || v === '1';
    if (isTrue(includeTags) || isTrue(includeEmpty)) {
      return this.groups.listPublic({
        includeEmpty: isTrue(includeEmpty),
      });
    }
    return this.groups.listForAdmin();
  }

  @Get('groups/options')
  @ApiOperation({
    summary:
      'همه گروه‌های فعال همراه با تگ‌های فعال (برای انتخابگر تگ فرم محصول)',
  })
  listGroupOptions() {
    return this.groups.listPublic({ includeEmpty: true });
  }

  @Post('groups')
  @ApiOperation({ summary: 'ایجاد گروه تگ' })
  createGroup(@Body() dto: CreateTagGroupDto) {
    return this.groups.create(dto);
  }

  @Put('groups/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر ترتیب گروه‌ها' })
  reorderGroups(@Body() dto: ReorderDto) {
    return this.groups.reorder(dto.ids);
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'ویرایش گروه تگ' })
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagGroupDto,
  ) {
    return this.groups.update(id, dto);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'حذف گروه تگ (فقط اگر تگی نداشته باشد)' })
  removeGroup(@Param('id', ParseIntPipe) id: number) {
    return this.groups.remove(id);
  }

  /* -------------------------------- tags --------------------------------- */

  @Get()
  @ApiOperation({ summary: 'لیست تگ‌ها با جستجو، فیلتر گروه و تعداد محصول' })
  list(@Query() qs: ListTagsQueryDto) {
    return this.tags.list(qs);
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد تگ' })
  create(@Body() dto: CreateTagDto) {
    return this.tags.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'ایجاد چند تگ یکجا در یک گروه' })
  createBulk(@Body() dto: BulkCreateTagsDto) {
    return this.tags.createBulk(dto);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ادغام دو تگ هم‌گروه' })
  merge(@Body() dto: MergeTagsDto) {
    return this.tags.merge(dto);
  }

  @Put('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر ترتیب تگ‌ها' })
  reorder(@Body() dto: ReorderDto) {
    return this.tags.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش تگ' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tags.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف تگ' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tags.remove(id);
  }
}
