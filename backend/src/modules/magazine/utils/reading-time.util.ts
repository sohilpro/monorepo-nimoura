/**
 * محاسبه زمان تقریبی مطالعه بر اساس تعداد کلمات محتوای HTML.
 * سرعت مطالعه فارسی به طور میانگین ~180 کلمه در دقیقه در نظر گرفته شده.
 */
export function calculateReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordsPerMinute = 180;
  const minutes = Math.ceil(words.length / wordsPerMinute);
  return Math.max(1, minutes);
}