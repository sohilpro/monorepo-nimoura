import { generateSlug } from 'src/common/utils/slug.helper';

/** Collapses repeated whitespace and trims the value. */
export function normalizeName(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

/** Builds a URL-safe slug from a tag or group name; falls back to "tag" for empty results. */
export function buildSlug(name: string): string {
  return generateSlug(normalizeName(name)) || 'tag';
}

/** Returns `base`, or `base-2`, `base-3`... until it is not in `taken`. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
