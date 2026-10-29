import { describe, it, expect } from 'vitest';
import { generateSlug } from '../../../src/common/utils/slug.helper';

describe('Slug Helper (slug.helper)', () => {
  it('should generate a valid slug from persian text', () => {
    const slug = generateSlug('چسب قطره ای وکارو');
    expect(slug).toBeDefined();
    expect(typeof slug).toBe('string');
    expect(slug.length).toBeGreaterThan(0);
  });

  it('should handle english characters properly', () => {
    const slug = generateSlug('Vecaro Super Glue 50g');
    expect(slug).toContain('vecaro');
    expect(slug).toContain('glue');
  });
});
