export default defineEventHandler(async (event) => {
  const { id, slug, categoryId, ...query } = getQuery(event);
  // پشتیبانی هم‌زمان از اسلاگ و شناسه عددی دسته‌بندی
  const identifier = slug ?? categoryId ?? id;

  return await apiFetch(
    event,
    `/products/category/${encodeURIComponent(String(identifier))}`,
    { query },
  );
});
