import { slugify as baseSlugify } from 'transliteration';

/**
 * دیکشنری دستی برای ترجمه برندها و اصطلاحات رایج
 */
const manualMap: Record<string, string> = {
  لورآل: 'loreal',
  نیتروژنا: 'neutrogena',
  'ضد آفتاب': 'sunscreen',
  'پوست چرب': 'oily-skin',
  'کرم مرطوب کننده': 'moisturizing-cream',
};

/**
 * جایگزینی دقیق‌تر حروف فارسی خاص قبل از transliteration
 */
function preCleanPersian(text: string): string {
  return text
    .replace(/ژ/g, 'zh')
    .replace(/ق/g, 'gh')
    .replace(/خ/g, 'kh')
    .replace(/چ/g, 'ch')
    .replace(/ش/g, 'sh')
    .replace(/ث/g, 's')
    .replace(/ص/g, 's')
    .replace(/ض/g, 'z')
    .replace(/ط/g, 't')
    .replace(/ظ/g, 'z')
    .replace(/غ/g, 'gh')
    .replace(/ی/g, 'i')
    .replace(/ک/g, 'k')
    .replace(/گ/g, 'g')
    .replace(/ه/g, 'h')
    .replace(/ز/g, 'z');
}

/**
 * جایگزینی دستی کلمات خاص (برندها و کلمات کلیدی)
 */
function applyManualMap(text: string): string {
  Object.entries(manualMap).forEach(([fa, en]) => {
    const regex = new RegExp(fa, 'g');
    text = text.replace(regex, en);
  });
  return text;
}

/**
 * تابع نهایی برای تولید slug به‌صورت خودکار
 */
export function generateSlug(input: string): string {
  const manualReplaced = applyManualMap(input);
  const preCleaned = preCleanPersian(manualReplaced);
  const transliterated = baseSlugify(preCleaned);
  return transliterated;
}
