export function createSlug(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^؀-ۿ0-9a-zA-Z\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
