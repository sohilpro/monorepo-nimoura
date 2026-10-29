/**
 * تولید slug برای عناوین فارسی و انگلیسی.
 * اعداد و حروف فارسی/عربی حفظ می‌شوند، فاصله‌ها با خط تیره جایگزین می‌شوند.
 */
export function generateSlug(title: string): string {
  const normalized = title
    .trim()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .toLowerCase();

  return normalized
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // حذف علائم نگارشی، حفظ حروف/اعداد یونیکد
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * افزودن پسوند تصادفی کوتاه به slug برای جلوگیری از تکراری شدن
 */
export function makeSlugUnique(baseSlug: string): string {
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${suffix}`;
}