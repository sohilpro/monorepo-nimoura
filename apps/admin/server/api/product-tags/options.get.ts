// همه گروه‌های فعال (حتی خالی) با تگ‌های فعال؛ برای انتخابگر تگ در فرم محصول
export default defineEventHandler((event) =>
  adminApiFetch(event, '/tags/groups/options', { method: 'GET' }),
);
