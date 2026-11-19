export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'accesstoken');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ابتدا وارد حساب کاربری خود شوید',
    });
  }
  const productId = Number(getRouterParam(event, 'productId'));
  const body = await readBody(event);
  const quantity = body?.quantity ?? 1;
  const variant = body?.variant ?? body?.variantId ?? null;

  return await apiFetch(event, '/cart/update', {
    method: 'PATCH',
    body: { productId, quantity, variant },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
