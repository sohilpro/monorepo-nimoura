export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);
  const id = getRouterParam(event, "id");

  try {
    const data = await apiFetch(event, `/addresses/${id}`, {
      method: "PATCH",
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
