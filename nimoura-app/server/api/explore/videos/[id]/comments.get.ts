export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const id = getRouterParam(event, "id");
  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/explore/videos/${id}/comments`, {
      query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});