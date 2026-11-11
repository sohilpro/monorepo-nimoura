// داده‌های فیلتر سایدبار (گروه‌های تگ با تعداد، بازه قیمت، شمارنده‌ها)
export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const q = getQuery(event);

  const query: Record<string, unknown> = {};
  const categoryId = q.categoryId ?? q.id;
  if (categoryId !== undefined && categoryId !== '') {
    query.categoryId = categoryId;
  }

  const allowedKeys = [
    'search',
    'brandId',
    'subBrandId',
    'minPrice',
    'maxPrice',
    'inStock',
    'isAvailable',
    'onSale',
    'tags',
  ] as const;

  for (const key of allowedKeys) {
    if (q[key] !== undefined && q[key] !== '') {
      query[key] = q[key];
    }
  }

  try {
    return await $fetch(`${apiBase}/products/catalog/facets`, {
      query,
    });
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 502,
      statusMessage: 'خطا در دریافت فیلترها',
    });
  }
});
