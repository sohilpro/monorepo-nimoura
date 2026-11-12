export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'accesstoken');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ابتدا وارد حساب کاربری خود شوید',
    });
  }

  const body = await readBody(event);

  return await apiFetch(event, '/comments', {
    method: 'POST',
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
