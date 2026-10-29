import { Controller, Get, Param } from '@nestjs/common';
import { AuthorsService } from '../authors.service';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('magazine/authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.authorsService.findBySlug(slug);
  }
}
