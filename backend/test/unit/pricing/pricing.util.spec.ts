import { describe, it, expect } from 'vitest';
import { calculateEffectiveUnitPrice } from '../../../src/common/utils/pricing.util';
import { resolveEffectiveUnitPrice } from '../../../src/common/utils/cart/pricing.helper';

describe('Pricing Utilities (pricing.util & pricing.helper)', () => {
  describe('calculateEffectiveUnitPrice', () => {
    it('should return base price when priceTiers is undefined or empty', () => {
      expect(calculateEffectiveUnitPrice(1, 50000)).toBe(50000);
      expect(calculateEffectiveUnitPrice(5, 50000, [])).toBe(50000);
    });

    it('should return base price if quantity does not reach the first tier', () => {
      const tiers: any[] = [
        { minQuantity: 10, price: 40000 },
        { minQuantity: 50, price: 30000 },
      ];
      expect(calculateEffectiveUnitPrice(5, 50000, tiers)).toBe(50000);
      expect(calculateEffectiveUnitPrice(9, 50000, tiers)).toBe(50000);
    });

    it('should apply the matching tier price when quantity meets minQuantity', () => {
      const tiers: any[] = [
        { minQuantity: 10, price: 45000 },
        { minQuantity: 50, price: 38000 },
        { minQuantity: 100, price: 32000 },
      ];

      expect(calculateEffectiveUnitPrice(10, 50000, tiers)).toBe(45000);
      expect(calculateEffectiveUnitPrice(25, 50000, tiers)).toBe(45000);
      expect(calculateEffectiveUnitPrice(50, 50000, tiers)).toBe(38000);
      expect(calculateEffectiveUnitPrice(99, 50000, tiers)).toBe(38000);
      expect(calculateEffectiveUnitPrice(100, 50000, tiers)).toBe(32000);
      expect(calculateEffectiveUnitPrice(500, 50000, tiers)).toBe(32000);
    });
  });

  describe('resolveEffectiveUnitPrice', () => {
    it('should prioritize priceDiscount over original price when discount exists', () => {
      const product: any = {
        price: 100000,
        priceDiscount: 85000,
        priceTiers: [],
      };
      expect(resolveEffectiveUnitPrice(1, product)).toBe(85000);
    });

    it('should use original price when priceDiscount is 0 or null', () => {
      const product: any = {
        price: 100000,
        priceDiscount: 0,
        priceTiers: [],
      };
      expect(resolveEffectiveUnitPrice(1, product)).toBe(100000);
    });

    it('should use variant prices and tiers when variant is provided', () => {
      const product: any = {
        price: 100000,
        priceDiscount: null,
      };
      const variant: any = {
        price: 120000,
        priceDiscount: 110000,
        priceTiers: [
          { minQuantity: 5, price: 95000 },
        ],
      };

      expect(resolveEffectiveUnitPrice(1, product, variant)).toBe(110000);
      expect(resolveEffectiveUnitPrice(10, product, variant)).toBe(95000);
    });
  });
});
