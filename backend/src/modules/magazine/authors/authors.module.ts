import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './controllers/authors.controller';
import { Author } from '../entities/author.entity';
import { AuthorsAdminController } from './controllers/authors-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorsController, AuthorsAdminController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
