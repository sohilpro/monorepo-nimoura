import { describe, it, expect } from 'vitest';
import { UserRole } from '@nimoura/shared-types';
import { IR_MOBILE_REGEX } from '../../../src/common/utils/mobile.helper';

describe('User Roles and Data Validation', () => {
  it('validates user role definitions', () => {
    expect(UserRole.USER).toBe('user');
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.OWNER).toBe('owner');
  });

  it('validates mobile number format for Iranian telecom operators', () => {
    const validMobiles = [
      '09121234567',
      '09351234567',
      '09011112233',
      '09901234567',
    ];
    const invalidMobiles = [
      '9121234567',
      '0912123456',
      '091212345678',
      '02112345678',
    ];

    for (const m of validMobiles) {
      expect(IR_MOBILE_REGEX.test(m)).toBe(true);
    }

    for (const m of invalidMobiles) {
      expect(IR_MOBILE_REGEX.test(m)).toBe(false);
    }
  });
});
