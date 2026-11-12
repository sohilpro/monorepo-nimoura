const ALLOWED_ACTIONS = new Set(['like', 'dislike']);

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const action = getRouterParam(event, 'action');
  const token = getCookie(event, 'accesstoken');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'برای ثبت واکنش ابتدا وارد حساب کاربری خود شوید',
    });
  }

  if (!id || !/^\d+$/.test(String(id)) || !action || !ALLOWED_ACTIONS.has(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'درخواست واکنش نامعتبر است',
    });
  }

  return await apiFetch(event, `/comments/${id}/${action}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
