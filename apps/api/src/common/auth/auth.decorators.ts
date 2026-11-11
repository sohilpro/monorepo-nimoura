// src/common/auth/auth.decorators.ts
import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { UserRole, AuthenticatedUser } from './jwt.types';

// ۱. دکوراتور روت‌های عمومی
export const IS_PUBLIC_KEY = 'is_public';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ۲. دکوراتور تعیین نقش‌های مجاز
export const ROLES_KEY = 'required_roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// ۳. دکوراتور استخراج کاربر جاری
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
