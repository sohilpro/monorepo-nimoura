export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'productId');
  const query = getQuery(event);
  const token = getCookie(event, 'accesstoken');

  if (!productId || !/^\d+$/.test(String(productId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه محصول نامعتبر است',
    });
  }

  return await apiFetch(event, `/comments/product/${productId}`, {
    query,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
});
