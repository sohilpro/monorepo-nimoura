import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { Tag } from '../entities/tag.entity';
import { TagsController } from './controllers/tags.controller';
import { TagsAdminController } from './controllers/tags-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController, TagsAdminController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
