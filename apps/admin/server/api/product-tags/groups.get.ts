// لیست گروه‌های تگ برای پنل ادمین (با تعداد تگ هر گروه)
export default defineEventHandler((event) =>
  adminApiFetch(event, '/tags/groups', { method: 'GET' }),
);
