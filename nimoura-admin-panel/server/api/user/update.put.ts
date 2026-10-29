export default defineEventHandler(async (event) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);
  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/users/${query.id}`, {
      method: "PUT",
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
