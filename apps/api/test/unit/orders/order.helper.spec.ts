import { describe, it, expect } from 'vitest';
import {
  generateOrderCode,
  calculateShipping,
} from '../../../src/common/utils/order.helper';

describe('Order Helper (order.helper)', () => {
  describe('generateOrderCode', () => {
    it('should generate an order code starting with NM-', () => {
      const code = generateOrderCode();
      expect(code.startsWith('NM-')).toBe(true);
    });

    it('should generate unique order codes on consecutive calls', () => {
      const code1 = generateOrderCode();
      const code2 = generateOrderCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('calculateShipping', () => {
    it('should return numeric cost directly if number is passed', () => {
      expect(calculateShipping(75000)).toBe(75000);
      expect(calculateShipping(0)).toBe(0);
    });

    it('should parse numeric strings to number', () => {
      expect(calculateShipping('65000')).toBe(65000);
      expect(calculateShipping(' 50000 ')).toBe(50000);
    });

    it('should return predefined rates for known shipping methods', () => {
      expect(calculateShipping('post')).toBe(90000);
      expect(calculateShipping('tipax')).toBe(120000);
      expect(calculateShipping('shiraz')).toBe(20000);
      expect(calculateShipping('free')).toBe(0);
      expect(calculateShipping('POST')).toBe(90000);
    });

    it('should throw error for unknown shipping method', () => {
      expect(() => calculateShipping('unknown_carrier')).toThrow(
        'روش ارسال نامعتبر است',
      );
    });
  });
});
