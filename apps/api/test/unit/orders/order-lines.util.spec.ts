import { describe, it, expect } from 'vitest';
import {
  lineKey,
  pickDefined,
  linesDiffer,
  diffLines,
  calcTotals,
  OrderLine,
} from '../../../src/modules/orders/utils/order-lines.util';

describe('Order Lines Utilities (order-lines.util)', () => {
  describe('lineKey', () => {
    it('should generate consistent key for product and variant', () => {
      expect(lineKey({ productId: 10, variantId: 5 })).toBe('10:5');
      expect(lineKey({ productId: 10, variantId: null })).toBe('10:0');
      expect(lineKey({ productId: 10, variantId: undefined as any })).toBe(
        '10:0',
      );
    });
  });

  describe('pickDefined', () => {
    it('should filter out undefined values from object', () => {
      const obj = { a: 1, b: undefined, c: 'hello', d: null };
      expect(pickDefined(obj)).toEqual({ a: 1, c: 'hello', d: null });
    });
  });

  describe('linesDiffer', () => {
    const l1: OrderLine = {
      productId: 1,
      variantId: null,
      quantity: 2,
      unitPrice: 50000,
      title: 'Item 1',
    };
    const l2: OrderLine = {
      productId: 2,
      variantId: null,
      quantity: 1,
      unitPrice: 30000,
      title: 'Item 2',
    };

    it('should return false for identical lists', () => {
      expect(linesDiffer([l1, l2], [{ ...l1 }, { ...l2 }])).toBe(false);
    });

    it('should return true when length differs', () => {
      expect(linesDiffer([l1], [l1, l2])).toBe(true);
    });

    it('should return true when quantity or unit price changes', () => {
      expect(linesDiffer([l1], [{ ...l1, quantity: 3 }])).toBe(true);
      expect(linesDiffer([l1], [{ ...l1, unitPrice: 45000 }])).toBe(true);
    });
  });

  describe('diffLines', () => {
    it('should calculate reserved and released stock correctly', () => {
      const oldLines: OrderLine[] = [
        {
          productId: 1,
          variantId: null,
          quantity: 3,
          unitPrice: 10000,
          title: 'Item 1',
        },
        {
          productId: 2,
          variantId: null,
          quantity: 2,
          unitPrice: 20000,
          title: 'Item 2',
        },
      ];

      const newLines: OrderLine[] = [
        {
          productId: 1,
          variantId: null,
          quantity: 5,
          unitPrice: 10000,
          title: 'Item 1',
        }, // +2 reserve
        {
          productId: 2,
          variantId: null,
          quantity: 1,
          unitPrice: 20000,
          title: 'Item 2',
        }, // -1 release
        {
          productId: 3,
          variantId: null,
          quantity: 4,
          unitPrice: 15000,
          title: 'Item 3',
        }, // +4 reserve
      ];

      const { reserve, release } = diffLines(oldLines, newLines);

      expect(reserve).toEqual([
        {
          productId: 1,
          variantId: null,
          quantity: 2,
          unitPrice: 10000,
          title: 'Item 1',
        },
        {
          productId: 3,
          variantId: null,
          quantity: 4,
          unitPrice: 15000,
          title: 'Item 3',
        },
      ]);

      expect(release).toEqual([
        {
          productId: 2,
          variantId: null,
          quantity: 1,
          unitPrice: 20000,
          title: 'Item 2',
        },
      ]);
    });
  });

  describe('calcTotals', () => {
    it('should compute subtotal and finalTotal with shipping and discount', () => {
      const lines: OrderLine[] = [
        {
          productId: 1,
          variantId: null,
          quantity: 2,
          unitPrice: 50000,
          title: 'Item 1',
        }, // 100,000
        {
          productId: 2,
          variantId: null,
          quantity: 1,
          unitPrice: 40000,
          title: 'Item 2',
        }, // 40,000
      ];

      const totals = calcTotals(lines, 25000, 15000);
      expect(totals.subtotal).toBe(140000);
      expect(totals.finalTotal).toBe(150000); // 140,000 + 25,000 - 15,000
    });
  });
});
