export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/addresses/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      query,
    });
    

    return data;
  } catch (error) {
    return error;
  }
});
