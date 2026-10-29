import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
// import { MediaService } from '../media.service';
import { UploadMediaDto } from '../dtos/upload-media.dto';
import { MediaOwnerType } from '../enums/media-owner-type.enum';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { MediaStaticService } from '../media-static.service';
import { MediaQueryDto } from '../dtos/media-query.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeleteMediaDto } from '../dtos/delete-media.dto';
import { ReassignMediaOwnerDto } from '../dtos/reassign-media-owner.dto';

@AdminController('media')
export class MediaAdminController {
  constructor(private readonly mediaService: MediaStaticService) {}

  @Get('list')
  @ApiOperation({
    summary: 'دریافت لیست مدیاها با فیلتر و صفحه‌بندی',
    description:
      'امکان جستجو در نام فایل‌ها، فیلتر بر اساس ownerType و وضعیت فایل‌های موقت (temp) برای پنل ادمین',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست فایل‌ها با متادیتای صفحه‌بندی با موفقیت برگشت داده شد.',
    schema: {
      example: {
        data: [
          {
            id: 15,
            ownerType: 'brand_logo',
            ownerId: '4',
            fileName: '4b4e3f42-9981-42cb-b2f5.webp',
            publicUrl:
              'https://api.vecaro.ir/uploads/brands/logos/4b4e3f42-9981-42cb-b2f5.webp',
            mimeType: 'image/webp',
            size: 45210,
            createdAt: '2026-09-20T12:00:00.000Z',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  })
  async getAllMedia(@Query() query: MediaQueryDto) {
    return await this.mediaService.findAll(query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ) {
    const media = await this.mediaService.upload(file, dto);
    return media;
  }

  @Post('upload-many')
  @UseInterceptors(FilesInterceptor('files', 20, { storage: memoryStorage() }))
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
    const media = await this.mediaService.uploadMany(files, dto);
    return media;
  }

  @Delete('urls')
  async deleteMedia(@Body() dto: DeleteMediaDto) {
    await this.mediaService.deleteByUrls(dto.urls);
    return { success: true };
  }

  @Delete(':id')
  async deleteById(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.deleteById(id);
    return { success: true };
  }

  @Delete()
  async deleteByOwner(
    @Query('ownerType') ownerType: MediaOwnerType,
    @Query('ownerId') ownerId: string,
  ) {
    await this.mediaService.deleteByOwner(ownerType, ownerId);
    return { success: true };
  }

  @Patch('reassign-owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر و اتصال مالک جدید به مدیاهای آپلودشده' })
  @ApiResponse({ status: 200, description: 'مالکیت با موفقیت به‌روزرسانی شد.' })
  async reassignOwner(
    @Body() dto: ReassignMediaOwnerDto,
  ): Promise<{ success: boolean }> {
    await this.mediaService.reassignOwner(
      dto.publicUrls,
      dto.newOwnerType,
      dto.newOwnerId,
    );
    return { success: true };
  }
}
