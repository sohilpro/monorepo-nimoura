// src/common/auth/decorators/admin-controller.decorator.ts
import { applyDecorators, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth.decorators';
import { UserRole } from '../jwt.types';

export function AdminController(path: string | string[] = '') {
  // فرمت‌بندی مسیرها: حذف اسلش‌های اضافی و پشتیبانی از آرایه
  const paths = Array.isArray(path) ? path : [path];
  const fullPaths = paths.map((p) => {
    const cleanPath = p.replace(/^\/+|\/+$/g, '');
    return cleanPath ? `admin/${cleanPath}` : 'admin';
  });

  // نام‌گذاری تمیز برای تب‌های Swagger (مثلا: Admin - Products)
  const firstPath = paths[0] ? paths[0].replace(/^\/+|\/+$/g, '') : 'admin';
  const tagTitle = firstPath
    ? `Admin - ${firstPath.charAt(0).toUpperCase() + firstPath.slice(1)}`
    : 'Admin';

  return applyDecorators(
    Controller(fullPaths.length === 1 ? fullPaths[0] : fullPaths),
    Roles(UserRole.ADMIN, UserRole.OWNER), // محدودسازی خودکار به ادمین و مالک
    ApiTags(tagTitle), // دسته‌بندی در مستندات سوگر
    ApiBearerAuth(), // نمایش آیکون قفل و نیاز به توکن در سوگر
  );
}
