export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'accesstoken');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ورود به حساب کاربری الزامی است',
    });
  }
  const body = await readBody(event);
  return await apiFetch(event, '/user/profile', {
    method: 'PUT',
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
