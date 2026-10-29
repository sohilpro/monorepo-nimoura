export default defineEventHandler(async (event) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");

  try {
    const data = await $fetch(`${apiBase}/tags/filters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});
