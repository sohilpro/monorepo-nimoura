import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Media } from './entities/media.entity';
import { FtpService } from './ftp.service';
import { ImageOptimizerService } from './image-optimizer.service';
import {
  MEDIA_OWNER_TYPE_ALLOWED_MIME,
  MEDIA_OWNER_TYPE_MAX_SIZE,
  MEDIA_OWNER_TYPE_OPTIMIZABLE,
  MEDIA_OWNER_TYPE_OPTIMIZE_OPTIONS,
  MEDIA_OWNER_TYPE_TO_FTP_DIR,
  MediaOwnerType,
} from './enums/media-owner-type.enum';

interface UploadOptions {
  ownerType: MediaOwnerType;
  ownerId: string;
  order?: number;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
    private readonly ftpService: FtpService,
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly config: ConfigService,
  ) {}

  /**
   * نقطه ورود واحد برای آپلود همه بخش‌ها.
   * فرقی نمی‌کند تامبنیل محصول باشد یا عکس داخل کامنت یا ویدیوی اکسپلور —
   * همه از همین متد رد می‌شوند، فقط ownerType فرق می‌کند.
   */
  async upload(file: Express.Multer.File, options: UploadOptions): Promise<Media> {
    // چک حجم/فرمت همیشه قبل از هرچیز دیگه، تا فایل سنگین/نامعتبر اصلاً به sharp نرسه
    this.validateFile(file, options.ownerType);

    let buffer = file.buffer;
    let mimeType = file.mimetype;
    let extension = extname(file.originalname);

    // فقط بخش‌های تصویری از optimizer رد می‌شن؛ ویدیو دست‌نخورده می‌ره روی FTP
    if (MEDIA_OWNER_TYPE_OPTIMIZABLE[options.ownerType]) {
      const optimizeOptions = MEDIA_OWNER_TYPE_OPTIMIZE_OPTIONS[options.ownerType];
      const result = await this.imageOptimizer.optimizeToWebp(
        file.buffer,
        file.mimetype,
        optimizeOptions,
      );
      buffer = result.buffer;
      extension = result.extension;
      mimeType = result.extension === '.svg' ? 'image/svg+xml' : 'image/webp';
    }

    const remoteDir = MEDIA_OWNER_TYPE_TO_FTP_DIR[options.ownerType];
    const fileName = `${randomUUID()}${extension}`;

    const ftpPath = await this.ftpService.uploadBuffer(buffer, remoteDir, fileName);

    const baseUrl =
      this.config.get<string>('APP_URL') ||
      this.config.get<string>('FTP_PUBLIC_BASE_URL') ||
      'https://vecaro.ir';
    const publicUrl = `${baseUrl}${ftpPath}`;

    const media = this.mediaRepo.create({
      ownerType: options.ownerType,
      ownerId: options.ownerId,
      order: options.order ?? 0,
      originalName: file.originalname,
      fileName,
      ftpPath,
      publicUrl,
      mimeType,
      size: buffer.length, // حجم واقعی بعد از بهینه‌سازی، نه حجم فایل خام کاربر
    });

    return this.mediaRepo.save(media);
  }

  /** آپلود چندتایی (مثلاً گالری محصول یا چند عکس داخل مقاله در یک درخواست) */
  async uploadMany(
    files: Express.Multer.File[],
    options: UploadOptions,
  ): Promise<Media[]> {
    const results: Media[] = [];
    for (let i = 0; i < files.length; i++) {
      const media = await this.upload(files[i], {
        ...options,
        order: (options.order ?? 0) + i,
      });
      results.push(media);
    }
    return results;
  }

  /** گرفتن همه مدیاهای یک مالک خاص (مثلاً همه عکس‌های یک محصول) */
  async findByOwner(ownerType: MediaOwnerType, ownerId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { ownerType, ownerId },
      order: { order: 'ASC' },
    });
  }

  /** حذف یک فایل مشخص (هم از FTP هم از دیتابیس) */
  async deleteById(id: number): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('فایل مورد نظر یافت نشد');

    await this.ftpService.deleteFile(media.ftpPath);
    await this.mediaRepo.remove(media);
  }

  /**
   * حذف تمام فایل‌های مرتبط با یک مالک — این متد کلیدیِ نیاز شماست:
   * وقتی یک محصول/برند/کامنت/مقاله حذف می‌شود، همین یک خط کافیست تا
   * تمام عکس‌های آن هم از هاست FTP و هم از دیتابیس پاک شوند.
   *
   * مثال استفاده در ProductService:
   *   async remove(id: string) {
   *     await this.mediaService.deleteByOwner(MediaOwnerType.PRODUCT_THUMBNAIL, id);
   *     await this.mediaService.deleteByOwner(MediaOwnerType.PRODUCT_GALLERY, id);
   *     await this.productRepo.delete(id);
   *   }
   */
  async deleteByOwner(ownerType: MediaOwnerType, ownerId: string): Promise<void> {
    const mediaList = await this.findByOwner(ownerType, ownerId);
    if (mediaList.length === 0) return;

    await this.ftpService.deleteMany(mediaList.map((m) => m.ftpPath));
    await this.mediaRepo.remove(mediaList);
  }

  /** حذف همه انواع مدیای مرتبط با یک مالک، بدون دانستن ownerType دقیق (پاک‌سازی کامل) */
  async deleteAllForOwnerId(ownerId: string, ownerTypes: MediaOwnerType[]): Promise<void> {
    for (const ownerType of ownerTypes) {
      await this.deleteByOwner(ownerType, ownerId);
    }
  }

  private validateFile(file: Express.Multer.File, ownerType: MediaOwnerType): void {
    if (!file) throw new BadRequestException('فایلی ارسال نشده است');

    const allowedMimes = MEDIA_OWNER_TYPE_ALLOWED_MIME[ownerType];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `فرمت فایل مجاز نیست. فرمت‌های مجاز برای این بخش: ${allowedMimes.join(', ')}`,
      );
    }

    const maxSize = MEDIA_OWNER_TYPE_MAX_SIZE[ownerType];
    if (file.size > maxSize) {
      throw new BadRequestException(
        `حجم فایل بیشتر از حد مجاز است (حداکثر ${(maxSize / (1024 * 1024)).toFixed(0)} مگابایت)`,
      );
    }
  }
}