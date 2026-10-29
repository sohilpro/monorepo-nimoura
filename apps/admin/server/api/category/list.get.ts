export default defineEventHandler(async (event) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/categories`, {
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
