import { describe, it, expect } from 'vitest';
import { createSlug } from '@nimoura/utils';

describe('Category Slug and Hierarchy Helpers', () => {
  it('generates consistent and clean category slugs', () => {
    expect(createSlug('لوازم آرایشی و زیبایی')).toBe('لوازم-آرایشی-و-زیبایی');
    expect(createSlug('مراقبت از پوست و مو')).toBe('مراقبت-از-پوست-و-مو');
    expect(createSlug('کرم‌های ضد آفتاب SPF 50')).toBe(
      'کرمهای-ضد-آفتاب-spf-50',
    );
  });

  it('handles empty and whitespace gracefully', () => {
    expect(createSlug('')).toBe('');
    expect(createSlug('   ')).toBe('');
  });
});
