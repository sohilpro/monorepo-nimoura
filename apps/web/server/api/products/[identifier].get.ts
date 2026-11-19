export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'identifier');
  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه یا اسلاگ محصول الزامی است',
    });
  }

  return await apiFetch(
    event,
    `/products/${encodeURIComponent(String(identifier))}`,
  );
});
