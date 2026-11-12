import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import {
  MEDIA_OWNER_TYPE_MAX_SIZE,
  MediaOwnerType,
} from '../enums/media-owner-type.enum';
import { MediaStaticService } from '../media-static.service';

@ApiTags('Store - Media')
@Controller('media')
export class MediaPublicController {
  constructor(private readonly mediaService: MediaStaticService) {}

  @Public()
  @Get()
  async findByOwner(
    @Query('ownerType') ownerType: MediaOwnerType,
    @Query('ownerId') ownerId: string,
  ) {
    const media = await this.mediaService.findByOwner(ownerType, ownerId);
    return media;
  }

  @ApiBearerAuth()
  @Post('comment-image')
  @ApiOperation({ summary: 'آپلود تصویر ضمیمه نظر توسط کاربر لاگین‌شده' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MEDIA_OWNER_TYPE_MAX_SIZE[MediaOwnerType.COMMENT_IMAGE],
      },
    }),
  )
  async uploadCommentImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: number,
  ) {
    return await this.mediaService.upload(file, {
      ownerType: MediaOwnerType.COMMENT_IMAGE,
      ownerId: `temp_${userId}`,
    });
  }
}
