import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tags } from './entities/tags.entity';
import { TagGroups } from './entities/tag-groups.entity';
import { TagGroupsService } from './services/tag-groups.service';
import { TagsService } from './services/tags.service';
import { TagFilterService } from './services/tag-filter.service';
import { TagsPublicController } from './controllers/tags-public.controller';
import { TagsAdminController } from './controllers/tags-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tags, TagGroups])],
  providers: [TagGroupsService, TagsService, TagFilterService],
  controllers: [TagsPublicController, TagsAdminController],
  exports: [TagsService, TagGroupsService, TagFilterService],
})
export class TagsModule {}
