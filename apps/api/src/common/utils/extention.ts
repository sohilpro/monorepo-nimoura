import { BadRequestException } from '@nestjs/common';
import path from 'path';
import { SafeExtension } from 'src/modules/media/dtos/upload-media.dto';

export const getSafeExtension = (filename: string): SafeExtension => {
  const extension = path.extname(filename).toLowerCase();

  const allowedExtensions: SafeExtension[] = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.svg',
    '.gif',
  ];

  if (!allowedExtensions.includes(extension as SafeExtension)) {
    throw new BadRequestException(`فرمت فایل ${extension} مجاز نیست`);
  }

  return extension as SafeExtension;
};
