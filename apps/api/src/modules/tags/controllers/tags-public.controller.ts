import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/auth/auth.decorators';
import { TagGroupsService } from '../services/tag-groups.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsPublicController {
  constructor(private readonly groups: TagGroupsService) {}

  @Public()
  @Get('groups')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'گروه‌های فعال تگ همراه با تگ‌های فعال هر گروه' })
  @ApiQuery({ name: 'filterable', required: false, type: Boolean })
  @ApiQuery({ name: 'includeEmpty', required: false, type: Boolean })
  list(
    @Query('filterable') filterable?: string,
    @Query('includeEmpty') includeEmpty?: string,
  ) {
    const isTrue = (v?: string) => v === 'true' || v === '1';
    return this.groups.listPublic({
      onlyFilterable: isTrue(filterable),
      includeEmpty: isTrue(includeEmpty),
    });
  }
}
