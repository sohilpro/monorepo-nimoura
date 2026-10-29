import { Controller, Get, Param } from '@nestjs/common';
import { TagsService } from '../tags.service';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('magazine/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }
}
