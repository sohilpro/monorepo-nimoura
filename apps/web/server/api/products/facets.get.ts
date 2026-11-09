// داده‌های فیلتر سایدبار (گروه‌های تگ با تعداد، بازه قیمت، شمارنده‌ها)
export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const { id, categoryId, page: _page, sort: _sort, limit: _limit, ...rest } = getQuery(event);

  try {
    return await $fetch(`${apiBase}/products/catalog/facets`, {
      query: { ...rest, categoryId: categoryId ?? id },
    });
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 502,
      statusMessage: 'خطا در دریافت فیلترها',
    });
  }
});
