export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'کلید ویترین الزامی است',
    });
  }

  const response: any = await apiFetch(
    event,
    `/showcase-configs/key/${encodeURIComponent(key)}`,
  );

  return response?.data ?? response;
});
