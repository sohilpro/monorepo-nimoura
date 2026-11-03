import { describe, it, expect } from 'vitest';
import { createSlug } from '@nimoura/utils';

describe('Brand Slug and SubBrand Utilities', () => {
  it('generates consistent slugs for Persian and English brand names', () => {
    expect(createSlug('لورآل پاریس')).toBe('لورآل-پاریس');
    expect(createSlug("L'Oreal Paris")).toBe('loreal-paris');
    expect(createSlug('این لی - Inlay')).toBe('این-لی-inlay');
  });

  it('handles brand sub-brands formatting', () => {
    const subBrands = ['روژ لب', 'ریمل', 'کرم پودر'];
    const formatted = subBrands.map((name) => ({
      name,
      slug: createSlug(name),
    }));

    expect(formatted).toHaveLength(3);
    expect(formatted[0].slug).toBe('روژ-لب');
  });
});
