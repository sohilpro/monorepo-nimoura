export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);
  if (!body.referralCode) {
    const cookieRef = getCookie(event, 'nimoura_ref');
    if (cookieRef) {
      body.referralCode = cookieRef;
    }
  }

  try {
    const data = await apiFetch(event, '/orders', {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    return data;
  } catch (error) {
    return error;
  }
});
