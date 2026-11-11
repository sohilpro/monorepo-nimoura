// src/common/auth/decorators/admin-controller.decorator.ts
import { applyDecorators, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth.decorators';
import { UserRole } from '../jwt.types';

export function AdminController(path: string = '') {
  // فرمت‌بندی مسیر: حذف اسلش‌های اضافی
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const fullPath = cleanPath ? `admin/${cleanPath}` : 'admin';

  // نام‌گذاری تمیز برای تب‌های Swagger (مثلا: Admin - Products)
  const tagTitle = cleanPath
    ? `Admin - ${cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1)}`
    : 'Admin';

  return applyDecorators(
    Controller(fullPath),
    Roles(UserRole.ADMIN, UserRole.OWNER), // محدودسازی خودکار به ادمین و مالک
    ApiTags(tagTitle), // دسته‌بندی در مستندات سوگر
    ApiBearerAuth(), // نمایش آیکون قفل و نیاز به توکن در سوگر
  );
}
