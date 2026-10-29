import { describe, it, expect } from 'vitest';
import {
  numberFormat,
  formatPrice,
  toEnglishDigits,
  toPersianDigits,
  createSlug,
  calculateDiscountPercentage,
  calculateDiscountAmount,
  generateOrderCode,
  calculateShipping,
  buildCategoryBreadcrumb,
  nearestPersianColorName,
} from '../src';

describe('numberFormat and digits', () => {
  it('formats numbers to Persian locale', () => {
    const formatted = numberFormat(1250000);
    expect(toEnglishDigits(formatted)).toBe('1,250,000');
  });

  it('converts Persian/Arabic digits to English', () => {
    expect(toEnglishDigits('۱۲۳۴۵')).toBe('12345');
    expect(toEnglishDigits('١٢٣٤٥')).toBe('12345');
  });

  it('converts English digits to Persian digits', () => {
    expect(toPersianDigits(123)).toBe('۱۲۳');
  });

  it('formats price with currency unit', () => {
    const formatted = formatPrice(50000);
    expect(formatted).toContain('تومان');
    expect(toEnglishDigits(formatted)).toContain('50,000');
  });

  it('handles null, undefined and empty values safely', () => {
    expect(numberFormat(null)).toBe('');
    expect(numberFormat(undefined)).toBe('');
    expect(numberFormat('')).toBe('');
    expect(formatPrice(null)).toBe('');
  });
});

describe('createSlug', () => {
  it('creates clean slug from Persian and English text', () => {
    expect(createSlug('کرم مرطوب کننده پوست')).toBe('کرم-مرطوب-کننده-پوست');
    expect(createSlug('Nimoura Face Cream 50ml')).toBe('nimoura-face-cream-50ml');
    expect(createSlug('رژ لب مایع شماره 02!')).toBe('رژ-لب-مایع-شماره-02');
  });

  it('handles empty and whitespace input', () => {
    expect(createSlug('')).toBe('');
    expect(createSlug('   ---   ')).toBe('');
  });
});

describe('discount calculations', () => {
  it('calculates discount percentage accurately', () => {
    expect(calculateDiscountPercentage(100000, 80000)).toBe(20);
    expect(calculateDiscountPercentage(200000, 150000)).toBe(25);
    expect(calculateDiscountPercentage(100000, 100000)).toBe(0);
    expect(calculateDiscountPercentage(0, 50000)).toBe(0);
  });

  it('calculates discount amount', () => {
    expect(calculateDiscountAmount(100000, 80000)).toBe(20000);
    expect(calculateDiscountAmount(50000, 50000)).toBe(0);
  });
});

describe('order helpers', () => {
  it('generates order code with prefix and date', () => {
    const code = generateOrderCode('NM');
    expect(code).toMatch(/^NM-\d{6}\d{4}$/);
  });

  it('calculates standard shipping costs', () => {
    expect(calculateShipping('post')).toBe(90000);
    expect(calculateShipping('tipax')).toBe(120000);
    expect(calculateShipping('free')).toBe(0);
    expect(calculateShipping(35000)).toBe(35000);
  });
});

describe('breadcrumb builder', () => {
  it('builds category hierarchy safely', () => {
    const root = { id: 1, name: 'آرایشی' };
    const sub = { id: 2, name: 'صورت', parent: root };
    const leaf = { id: 3, name: 'کرم پودر', parent: sub };

    const breadcrumbs = buildCategoryBreadcrumb(leaf);
    expect(breadcrumbs).toHaveLength(4);
    expect(breadcrumbs[0].label).toBe('خانه');
    expect(breadcrumbs[1].label).toBe('آرایشی');
    expect(breadcrumbs[2].label).toBe('صورت');
    expect(breadcrumbs[3].label).toBe('کرم پودر');
    expect(breadcrumbs[3].href).toBeUndefined(); // Last item has no href
  });

  it('prevents infinite loops on circular category structures', () => {
    const nodeA: any = { id: 10, name: 'دسته اول' };
    const nodeB: any = { id: 20, name: 'دسته دوم', parent: nodeA };
    nodeA.parent = nodeB; // Circular reference

    const breadcrumbs = buildCategoryBreadcrumb(nodeB);
    expect(breadcrumbs.length).toBeGreaterThan(0);
  });
});

describe('nearestPersianColorName', () => {
  it('finds closest Persian color name for hex code', () => {
    const red = nearestPersianColorName('#FF0000');
    expect(red.name).toBe('قرمز');

    const white = nearestPersianColorName('#FFFFFF');
    expect(white.name).toBe('سفید');

    const black = nearestPersianColorName('#000000');
    expect(black.name).toBe('سیاه');
  });
});
