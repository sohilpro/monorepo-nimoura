export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const { id, slug, brandSlug, ...query } = getQuery(event);
  const identifier = slug ?? brandSlug ?? id;

  try {
    const data = await $fetch(
      `${apiBase}/products/brand/${encodeURIComponent(String(identifier))}`,
      { query },
    );

    return data;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 502,
      statusMessage: error?.data?.message || 'خطا در دریافت محصولات برند',
    });
  }
});
