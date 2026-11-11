import { describe, it, expect } from 'vitest';
import {
  calculateDiscountPercentage,
  calculateDiscountAmount,
} from '@nimoura/utils';

describe('Product Discount and Pricing Calculations', () => {
  it('calculates percentage correctly for discounted products', () => {
    expect(calculateDiscountPercentage(500000, 400000)).toBe(20);
    expect(calculateDiscountPercentage(120000, 90000)).toBe(25);
    expect(calculateDiscountPercentage(350000, 315000)).toBe(10);
  });

  it('handles zero or invalid prices without throwing error', () => {
    expect(calculateDiscountPercentage(0, 0)).toBe(0);
    expect(calculateDiscountPercentage(100000, 150000)).toBe(0); // Discount price higher than base
    expect(calculateDiscountAmount(0, 50000)).toBe(0);
  });

  it('calculates total discount amount', () => {
    expect(calculateDiscountAmount(250000, 180000)).toBe(70000);
  });
});
