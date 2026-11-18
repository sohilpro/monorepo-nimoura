export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');
  const query = getQuery(event);

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'کلید جایگاه بنر الزامی است',
    });
  }

  return await apiFetch(
    event,
    `/banners/position/${encodeURIComponent(String(key))}`,
    { query },
  );
});
