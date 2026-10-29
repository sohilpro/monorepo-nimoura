import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UsernameEnum } from '../../../src/common/auth/enums/username.enum';
import { BadRequestException } from '@nestjs/common';

describe('AuthService - DetectUsername', () => {
  let authService: AuthService;

  beforeEach(() => {
    const mockUserRepo = {} as any;
    const mockOtpRepo = {} as any;
    const mockTokensService = {} as any;
    const mockSmsService = {} as any;

    authService = new AuthService(
      mockUserRepo,
      mockOtpRepo,
      mockTokensService,
      mockSmsService,
    );
  });

  it('should detect valid Iranian mobile number', () => {
    const result = authService.DetectUsername('09123456789');
    expect(result.type).toBe(UsernameEnum.Mobile);
    expect(result.username).toBe('09123456789');

    const result2 = authService.DetectUsername('09351234567');
    expect(result2.type).toBe(UsernameEnum.Mobile);
  });

  it('should detect valid email address', () => {
    const result = authService.DetectUsername('info@vecaro.ir');
    expect(result.type).toBe(UsernameEnum.Email);
    expect(result.username).toBe('info@vecaro.ir');
  });

  it('should throw BadRequestException for invalid input', () => {
    expect(() => authService.DetectUsername('not-an-email-or-phone')).toThrow(BadRequestException);
    expect(() => authService.DetectUsername('12345')).toThrow(BadRequestException);
  });
});
