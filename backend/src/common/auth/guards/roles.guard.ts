// src/common/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, IS_PUBLIC_KEY } from '../auth.decorators';
import { UserRole, AuthenticatedUser } from '../jwt.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // اگر برای روت نقشی تعریف نشده باشد، دسترسی برای همه کاربران لاگین‌کرده باز است
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();

    if (!user || !user.role) {
      throw new ForbiddenException('دسترسی مجاز نیست');
    }

    const hasPermission = requiredRoles.includes(user.role);
    if (!hasPermission) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    return true;
  }
}