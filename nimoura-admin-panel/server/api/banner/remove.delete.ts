export default defineEventHandler(async (event) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/banners/${query.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});
