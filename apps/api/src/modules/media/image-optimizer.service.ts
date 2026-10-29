import {
  Injectable,
  OnModuleInit,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import pLimit from 'p-limit';
import { SafeExtension } from './dtos/upload-media.dto';

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface OptimizedResult {
  buffer: Buffer;
  extension: SafeExtension;
}

const MAX_INPUT_PIXELS = 50_000_000; // ~50MP، جلوی pixel-bomb رو صریحاً می‌گیره
const CONCURRENCY_LIMIT = 3; // متناسب با منابع سرور تنظیم کن

@Injectable()
export class ImageOptimizerService implements OnModuleInit {
  private readonly logger = new Logger(ImageOptimizerService.name);
  private readonly limit = pLimit(CONCURRENCY_LIMIT);

  onModuleInit() {
    sharp.cache(false);
    sharp.concurrency(1);
  }

  async optimizeToWebp(
    buffer: Buffer,
    declaredMimetype: string,
    options: OptimizeOptions = {},
  ): Promise<OptimizedResult> {
    const detected = await fileTypeFromBuffer(buffer);
    const realMime = detected?.mime ?? declaredMimetype;

    const isSvg =
      declaredMimetype === 'image/svg+xml' &&
      (realMime === 'image/svg+xml' || this.looksLikeSvg(buffer));

    if (isSvg) {
      // SVG بدون پردازش شارپ عبور می‌کنه؛ فقط جاهایی مجازه که ریسکش پذیرفته شده (بنر/ادمین)
      return { buffer, extension: '.svg' };
    }

    // اگه mimetype اعلامی با محتوای واقعی فایل نمی‌خونه، مشکوکه - رد کن
    if (detected && declaredMimetype !== realMime) {
      throw new UnprocessableEntityException(
        'نوع فایل با محتوای واقعی آن مطابقت ندارد',
      );
    }

    const { maxWidth = 1920, maxHeight = 1920, quality = 80 } = options;

    return this.limit(async () => {
      try {
        const optimizedBuffer = await sharp(buffer, {
          failOn: 'error',
          limitInputPixels: MAX_INPUT_PIXELS,
        })
          .rotate()
          .resize({
            width: maxWidth,
            height: maxHeight,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality, effort: 4 })
          .toBuffer();

        return { buffer: optimizedBuffer, extension: '.webp' as SafeExtension };
      } catch (error: any) {
        this.logger.error(`خطا در پردازش تصویر با شارپ: ${error.message}`);
        // هیچ fallback به فایل خام نداریم - فایل مشکوک/خراب هرگز ذخیره نمی‌شه
        throw new UnprocessableEntityException(
          'فایل تصویر معتبر نیست یا قابل پردازش نمی‌باشد',
        );
      }
    });
  }

  private looksLikeSvg(buffer: Buffer): boolean {
    const head = buffer.subarray(0, 512).toString('utf8').trim().toLowerCase();
    return head.startsWith('<?xml') || head.startsWith('<svg');
  }
}
