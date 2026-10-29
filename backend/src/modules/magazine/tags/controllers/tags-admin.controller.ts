import { Body, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TagsService } from '../tags.service';
import { CreateTagDto, UpdateTagDto } from '../../dtos/misc.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@AdminController('magazine/tags')
export class TagsAdminController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
