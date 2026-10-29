const faNumberFormatter = new Intl.NumberFormat('fa-IR');

export function numberFormat(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  const numericValue =
    typeof value === 'string'
      ? Number(toEnglishDigits(value).replace(/[^\d.-]/g, ''))
      : value;

  if (Number.isNaN(numericValue)) return String(value);

  return faNumberFormatter.format(numericValue);
}

export function formatPrice(
  price: number | string | null | undefined,
  unit: 'تومان' | 'ریال' | '' = 'تومان',
): string {
  const formatted = numberFormat(price);
  if (!formatted) return '';
  return unit ? `${formatted} ${unit}` : formatted;
}

export function toEnglishDigits(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return str
    .replace(/[۰-۹]/g, (w) => String(persianDigits.indexOf(w)))
    .replace(/[٠-٩]/g, (w) => String(arabicDigits.indexOf(w)));
}

export function toPersianDigits(value: number | string): string {
  if (value === null || value === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(value).replace(/[0-9]/g, (w) => persianDigits[Number(w)]);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fa-IR');
}
