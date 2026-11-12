export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'accesstoken');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ابتدا وارد حساب کاربری خود شوید',
    });
  }

  const query = getQuery(event);
  const body = await readBody(event).catch(() => ({}));
  const variantId =
    query.variantId ?? body?.variantId ?? body?.variant?.id ?? undefined;

  return await apiFetch(event, `/cart/remove/${query.id}`, {
    method: 'DELETE',
    query: variantId ? { variantId } : undefined,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
