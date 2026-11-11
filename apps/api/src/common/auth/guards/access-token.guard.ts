// src/common/auth/guards/access-token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../auth.decorators';
import { JwtPayload, AuthenticatedUser } from '../jwt.types';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('توکن احراز هویت یافت نشد');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // نگاشت پی‌لود به مدل کاربر معتبر
      const user: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
      };

      request['user'] = user;
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('نشست کاربری شما منقضی شده است');
      }
      throw new UnauthorizedException('توکن نامعتبر یا دستکاری شده است');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
