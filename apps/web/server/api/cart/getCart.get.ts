export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'accesstoken');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ابتدا وارد حساب کاربری خود شوید',
    });
  }

  return await apiFetch(event, '/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
