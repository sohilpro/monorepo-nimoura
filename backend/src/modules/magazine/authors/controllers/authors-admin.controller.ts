import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthorsService } from '../authors.service';
import { CreateAuthorDto, UpdateAuthorDto } from '../../dtos/misc.dto';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';

@AdminController('magazine/authors')
export class AuthorsAdminController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  findAllAdmin() {
    return this.authorsService.findAllAdmin();
  }

  @Post()
  create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAuthorDto) {
    return this.authorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.remove(id);
  }
}
