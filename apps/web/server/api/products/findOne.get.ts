export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const identifier = query.slug ?? query.id;

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
