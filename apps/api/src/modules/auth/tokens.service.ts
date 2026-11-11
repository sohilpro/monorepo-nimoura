import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthMessage } from '../../common/auth/enums/auth-message.enum';
import { OtpTokenPayloadType } from './types/otp-token.type';
import { AccessTokenPayloadType } from './types/access-token.type';
import { RefreshTokenPayloadType } from './types/refresh-token.type';
import { Users } from '../users/entities/users.entity';
import { JwtPayload } from 'src/common/auth/jwt.types';

@Injectable()
export class TokensService {
  constructor(private readonly jwtService: JwtService) {}

  genOtpToken(username: string): string {
    return this.jwtService.sign(
      { username },
      {
        secret: process.env.OTP_TOKEN_SECRET || 'default_otp_secret',
        expiresIn: '2m',
      },
    );
  }

  genAccessToken(user: Users): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      phone: user.mobile,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30d',
    });
  }

  genRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
        expiresIn: '1y',
      },
    );
  }

  verOtpToken(token: string): OtpTokenPayloadType {
    try {
      return this.jwtService.verify<OtpTokenPayloadType>(token, {
        secret: process.env.OTP_TOKEN_SECRET || 'default_otp_secret',
      });
    } catch {
      throw new UnauthorizedException(AuthMessage.ExpiredOtpCode);
    }
  }

  verAccessToken(token: string): AccessTokenPayloadType | undefined {
    try {
      return this.jwtService.verify<AccessTokenPayloadType>(token, {
        secret: process.env.JWT_SECRET || 'default_jwt_secret',
      });
    } catch {
      return undefined;
    }
  }

  verRefreshToken(token: string): RefreshTokenPayloadType {
    try {
      return this.jwtService.verify<RefreshTokenPayloadType>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
      });
    } catch {
      throw new UnauthorizedException(AuthMessage.LoginRequired);
    }
  }
}
