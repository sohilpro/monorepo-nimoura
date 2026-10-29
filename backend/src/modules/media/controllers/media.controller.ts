import { Controller, Get, Query } from '@nestjs/common';
// import { MediaService } from '../media.service';
import { MediaOwnerType } from '../enums/media-owner-type.enum';
import { MediaStaticService } from '../media-static.service';

@Controller('media')
export class MediaPublicController {
  constructor(private readonly mediaService: MediaStaticService) {}

  @Get()
  async findByOwner(
    @Query('ownerType') ownerType: MediaOwnerType,
    @Query('ownerId') ownerId: string,
  ) {
    const media = await this.mediaService.findByOwner(ownerType, ownerId);
    return media;
  }
}
