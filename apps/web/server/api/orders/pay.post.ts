export default defineEventHandler(async (event) => {
  const {
    apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);
  const body = await readBody(event);

  try {
    const data = await apiFetch(event, `/orders/${query.id}/pay`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body,
    });

    return data;
  } catch (error) {
    return error;
  }
});
