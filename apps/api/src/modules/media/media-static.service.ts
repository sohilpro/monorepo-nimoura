import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { promises as fs, existsSync } from 'fs';
import { Media } from './entities/media.entity';
import { ImageOptimizerService } from './image-optimizer.service';
import {
  MEDIA_OWNER_TYPE_ALLOWED_MIME,
  MEDIA_OWNER_TYPE_MAX_SIZE,
  MEDIA_OWNER_TYPE_OPTIMIZABLE,
  MEDIA_OWNER_TYPE_OPTIMIZE_OPTIONS,
  MEDIA_OWNER_TYPE_TO_FTP_DIR,
  MediaOwnerType,
} from './enums/media-owner-type.enum';
import { MediaQueryDto } from './dtos/media-query.dto';
import { getErrorCode } from 'src/common/utils/error.helper';

interface UploadOptions {
  ownerType: MediaOwnerType;
  ownerId: string;
  order?: number;
}

@Injectable()
export class MediaStaticService {
  // روت ذخیره‌سازی فایل‌ها داخل پوشه uploads (پشتیبانی همزمان از اجرای ریشه مونو‌ریپو و داکر)
  private readonly rootUploadDir = existsSync(
    join(process.cwd(), 'apps', 'backend', 'uploads'),
  )
    ? join(process.cwd(), 'apps', 'backend', 'uploads')
    : join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly config: ConfigService,
  ) {}

  /**
   * دریافت لیست تمام فایل‌های آپلود شده همراه با فیلتر، جستجو و صفحه‌بندی
   */
  async findAll(query: MediaQueryDto = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      ownerType,
      ownerId,
      isTemp,
      mimeType,
      sortBy = 'id',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.mediaRepo
      .createQueryBuilder('media')
      .select([
        'media.id',
        'media.ownerType',
        'media.ownerId',
        'media.order',
        'media.originalName',
        'media.fileName',
        'media.publicUrl',
        'media.mimeType',
        'media.size',
        'media.createdAt',
      ]);

    // ۱. فیلتر بر اساس نوع مالک (ownerType)
    if (ownerType) {
      queryBuilder.andWhere('media.ownerType = :ownerType', { ownerType });
    }

    // ۲. فیلتر بر اساس شناسه مالک (ownerId)
    if (ownerId) {
      queryBuilder.andWhere('media.ownerId = :ownerId', {
        ownerId: String(ownerId).trim(),
      });
    }

    // ۳. فیلتر فایل‌های موقت یا متصل‌شده
    if (isTemp !== undefined) {
      if (isTemp) {
        queryBuilder.andWhere(
          "(media.ownerId = 'temp' OR media.ownerId LIKE 'temp_%')",
        );
      } else {
        queryBuilder.andWhere(
          "(media.ownerId != 'temp' AND media.ownerId NOT LIKE 'temp_%')",
        );
      }
    }

    // ۴. فیلتر بر اساس فرمت فایل
    if (mimeType) {
      queryBuilder.andWhere('media.mimeType LIKE :mimeType', {
        mimeType: `%${mimeType.trim()}%`,
      });
    }

    // ۵. جستجوی بهینه و Case-Insensitive در نام فایل‌ها
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(media.originalName) LIKE LOWER(:search) OR LOWER(media.fileName) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    // ۶. ایمن‌سازی مرتب‌سازی (White-Listing Columns)
    const allowedSortFields = ['id', 'size', 'createdAt', 'order'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder =
      String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // ۷. صفحه‌بندی امن
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    queryBuilder
      .orderBy(`media.${safeSortBy}`, safeSortOrder)
      .skip(skip)
      .take(safeLimit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: safePage * safeLimit < total,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  /**
   * نقطه ورود واحد برای آپلود همه بخش‌ها.
   */
  async upload(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<Media> {
    this.validateFile(file, options.ownerType);

    let buffer = file.buffer;
    let mimeType = file.mimetype;
    let extension = extname(file.originalname);

    if (MEDIA_OWNER_TYPE_OPTIMIZABLE[options.ownerType]) {
      const optimizeOptions =
        MEDIA_OWNER_TYPE_OPTIMIZE_OPTIONS[options.ownerType];
      const result = await this.imageOptimizer.optimizeToWebp(
        file.buffer,
        file.mimetype,
        optimizeOptions,
      );
      buffer = result.buffer;
      extension = result.extension;
      mimeType = result.extension === '.svg' ? 'image/svg+xml' : 'image/webp';
    }

    // حذف uploads و اسلش‌های اضافی از ابتدای مسیر اینام
    const rawDir = MEDIA_OWNER_TYPE_TO_FTP_DIR[options.ownerType] || '';
    const subDir = rawDir.replace(/^\/?(uploads\/?)?/i, '').replace(/\/+$/, '');
    const fileName = `${randomUUID()}${extension}`;

    // مسیر روی دیسک: uploads/products/thumbnails
    const targetFolder = subDir
      ? join(this.rootUploadDir, subDir)
      : this.rootUploadDir;
    await fs.mkdir(targetFolder, { recursive: true });

    // مسیر ذخیره برای دیتابیس بدون کلمه uploads
    const localRelativePath = subDir
      ? `${subDir}/${fileName}`.replace(/\\/g, '/')
      : fileName;
    const absoluteFilePath = join(targetFolder, fileName);
    await fs.writeFile(absoluteFilePath, buffer);

    const baseUrl =
      this.config.get<string>('APP_URL') ||
      this.config.get<string>('BASE_URL') ||
      'https://vecaro.ir';

    // اینجا دقیقا یک بار uploads اضافه می‌شود
    const publicUrl = `${baseUrl}/uploads/${localRelativePath}`;

    const media = this.mediaRepo.create({
      ownerType: options.ownerType,
      ownerId: options.ownerId,
      order: options.order ?? 0,
      originalName: file.originalname,
      fileName,
      ftpPath: localRelativePath, // خروجی تمیز: products/thumbnails/uuid.webp
      publicUrl, // خروجی تمیز: https://vecaro.ir/uploads/products/thumbnails/uuid.webp
      mimeType,
      size: buffer.length,
    });

    return this.mediaRepo.save(media);
  }

  /** آپلود چندتایی */
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

  /** گرفتن همه مدیاهای یک مالک خاص */
  async findByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
  ): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { ownerType, ownerId },
      select: {
        id: true,
        ownerType: true,
        ownerId: true,
        order: true,
        originalName: true,
        fileName: true,
        publicUrl: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
      order: { order: 'ASC' },
      loadEagerRelations: false,
    });
  }

  /** حذف یک فایل مشخص از دیسک محلی و دیتابیس */
  async deleteById(id: number): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('فایل مورد نظر یافت نشد');

    await this.removeFileFromDisk(media.ftpPath);
    await this.mediaRepo.remove(media);
  }

  /** حذف تمام فایل‌های مرتبط با یک مالک */
  async deleteByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
  ): Promise<void> {
    const mediaList = await this.findByOwner(ownerType, ownerId);
    if (mediaList.length === 0) return;

    await Promise.all(mediaList.map((m) => this.removeFileFromDisk(m.ftpPath)));
    await this.mediaRepo.remove(mediaList);
  }

  /**
   * حذف یک یا چند فایل از دیسک و دیتابیس بر اساس آدرس عمومی (publicUrl)
   */
  async deleteByUrls(urls: (string | undefined | null)[]): Promise<void> {
    const validUrls = urls.filter((url): url is string => Boolean(url));
    if (validUrls.length === 0) return;

    // پیدا کردن مدیاها بر اساس URL
    const mediaList = await this.mediaRepo
      .createQueryBuilder('media')
      .where('media.publicUrl IN (:...validUrls)', { validUrls })
      .getMany();

    if (mediaList.length === 0) {
      // اگر به هر دلیلی رکورد در دیتابیس نبود اما فایل فیزیکی روی دیسک هست، از روی URL مسیر دیسک را پاک می‌کنیم
      for (const url of validUrls) {
        const relativePath = url.split('/uploads/')[1];
        if (relativePath) {
          await this.removeFileFromDisk(relativePath);
        }
      }
      return;
    }

    // ۱. حذف فایل‌های فیزیکی از روی دیسک
    await Promise.all(mediaList.map((m) => this.removeFileFromDisk(m.ftpPath)));

    // ۲. حذف رکوردها از دیتابیس
    await this.mediaRepo.remove(mediaList);
  }

  async reassignOwner(
    publicUrls: (string | undefined | null)[],
    newOwnerType: MediaOwnerType,
    newOwnerId: string,
  ): Promise<void> {
    const validUrls = publicUrls.filter((url): url is string => Boolean(url));
    if (validUrls.length === 0) return;

    await this.mediaRepo
      .createQueryBuilder()
      .update(Media)
      .set({ ownerType: newOwnerType, ownerId: newOwnerId })
      .where('publicUrl IN (:...validUrls)', { validUrls })
      .execute();
  }

  /** حذف همه انواع مدیای مرتبط با یک مالک */
  async deleteAllForOwnerId(
    ownerId: string,
    ownerTypes: MediaOwnerType[],
  ): Promise<void> {
    for (const ownerType of ownerTypes) {
      await this.deleteByOwner(ownerType, ownerId);
    }
  }

  /** حذف فیزیکی فایل از روی سیستم‌عامل بدون خطا در صورت عدم وجود */
  private async removeFileFromDisk(relativePath: string): Promise<void> {
    try {
      const fullPath = join(this.rootUploadDir, relativePath);
      await fs.unlink(fullPath);
    } catch (error: unknown) {
      if (getErrorCode(error) !== 'ENOENT') {
        throw error;
      }
    }
  }

  private validateFile(
    file: Express.Multer.File,
    ownerType: MediaOwnerType,
  ): void {
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

    if (file.buffer && this.isImageMime(file.mimetype)) {
      if (!this.matchesImageMagicBytes(file.buffer, file.mimetype)) {
        throw new BadRequestException('محتوای فایل با فرمت تصویر مطابقت ندارد');
      }
    }
  }

  private isImageMime(mime: string): boolean {
    return [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ].includes(mime);
  }

  private matchesImageMagicBytes(buffer: Buffer, mime: string): boolean {
    if (mime === 'image/jpeg') {
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    }
    if (mime === 'image/png') {
      return (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }
    if (mime === 'image/webp') {
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }
    if (mime === 'image/svg+xml') {
      const head = buffer.subarray(0, 256).toString('utf8').trimStart();
      return head.startsWith('<svg') || head.startsWith('<?xml');
    }
    return true;
  }
}
