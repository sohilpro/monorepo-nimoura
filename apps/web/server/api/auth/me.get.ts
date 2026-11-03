export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'accesstoken');

  if (!token) {
    return null;
  }

  try {
    return await apiFetch(event, '/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return null;
  }
});
