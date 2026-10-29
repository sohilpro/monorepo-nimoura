import { describe, it, expect, beforeEach } from 'vitest';
import { TokensService } from '../../../src/modules/auth/tokens.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../../../src/modules/users/entities/users.entity';
import { UserRole } from '../../../src/common/auth/jwt.types';

describe('TokensService Unit Tests', () => {
  let tokensService: TokensService;
  let jwtService: JwtService;

  beforeEach(() => {
    process.env.OTP_TOKEN_SECRET = 'test_otp_secret_1234567890';
    process.env.JWT_SECRET = 'test_jwt_secret_1234567890';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_1234567890';

    jwtService = new JwtService();
    tokensService = new TokensService(jwtService);
  });

  describe('OTP Tokens', () => {
    it('should generate and verify an OTP token correctly', () => {
      const username = '09123456789';
      const token = tokensService.genOtpToken(username);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const payload = tokensService.verOtpToken(token);
      expect(payload).toBeDefined();
      expect(payload.username).toBe(username);
    });

    it('should fail verification for invalid token', () => {
      expect(() => tokensService.verOtpToken('invalid_token')).toThrow();
    });
  });

  describe('Access & Refresh Tokens', () => {
    it('should generate and verify access token with user details', () => {
      const mockUser = {
        id: 42,
        email: 'user@vecaro.ir',
        mobile: '09171234567',
        role: UserRole.USER,
      } as Users;

      const accessToken = tokensService.genAccessToken(mockUser);
      expect(accessToken).toBeDefined();

      const decoded = tokensService.verAccessToken(accessToken);
      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe(42);
      expect(decoded?.phone).toBe('09171234567');
      expect(decoded?.role).toBe(UserRole.USER);
    });

    it('should generate and verify refresh token', () => {
      const userId = 99;
      const refreshToken = tokensService.genRefreshToken(userId);
      expect(refreshToken).toBeDefined();

      const decoded = tokensService.verRefreshToken(refreshToken);
      expect(decoded.id).toBe(99);
    });
  });
});
