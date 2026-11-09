/**
 * Groups created by the migration. Admins can add, rename, reorder or disable
 * any of them (or create new groups) from the admin panel.
 */
export const DEFAULT_TAG_GROUPS = [
  { slug: 'nature', name: 'ماهیت محصول', sortOrder: 10 },
  { slug: 'skin-type', name: 'نوع پوست', sortOrder: 20 },
  { slug: 'hair-type', name: 'جنس مو', sortOrder: 30 },
  { slug: 'benefit', name: 'مزیت', sortOrder: 40 },
  { slug: 'concern', name: 'نیاز و دغدغه', sortOrder: 50 },
  { slug: 'feature', name: 'ویژگی‌ها', sortOrder: 60 },
  { slug: 'season', name: 'مناسب فصل', sortOrder: 70 },
  { slug: 'brand-line', name: 'لاین برند', sortOrder: 80 },
] as const;
