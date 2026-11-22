/**
 * آدرس مدیای برگشتی از بکند را به آدرس همان دامنه (/uploads/...) تبدیل میکند.
 *
 * بکند هنگام آپلود، آدرس کامل ذخیره میکند (مثلاً
 * https://nimoura.ir/uploads/products/thumbnails/<uuid>.webp یا
 * http://localhost:4000/uploads/banners/<uuid>.webp)
 * ولی سایت باید عکس را از /uploads/... بخواند تا هم قابل کش باشد و هم
 * با Nuxt Image تداخل نکند.
 *
 * خارج از این الگو (لینکهای خارجی، تصاویر static داخل public، data URI)
 * بدون تغییر برگردانده میشوند.
 */
const UPLOADS_MARKER = '/uploads/';

export function formatImageUrl(value?: string | null): string {
  if (!value) return '';

  const input = String(value).trim();
  if (!input) return '';

  // تصاویر inline نباید دستکاری شوند
  if (/^(data:|blob:)/i.test(input)) return input;

  try {
    const parsed = new URL(input, 'http://local.invalid');
    const markerIndex = parsed.pathname.indexOf(UPLOADS_MARKER);
    if (markerIndex !== -1) {
      const localPath = parsed.pathname.slice(markerIndex);
      return `${localPath}${parsed.search}`;
    }
  } catch {
    // رشتهی نامعتبر را همانطور برمیگردانیم تا کامپوننت تصمیم بگیرد
  }

  return input;
}
