export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);

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
