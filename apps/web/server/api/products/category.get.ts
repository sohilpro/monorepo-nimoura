export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const { id, slug, categoryId, ...query } = getQuery(event);
  // پشتیبانی هم‌زمان از اسلاگ و شناسه عددی دسته‌بندی
  const identifier = slug ?? categoryId ?? id;

  try {
    const data = await $fetch(
      `${apiBase}/products/category/${encodeURIComponent(String(identifier))}`,
      { query },
    );

    return data;
  } catch (error) {
    return error;
  }
});
