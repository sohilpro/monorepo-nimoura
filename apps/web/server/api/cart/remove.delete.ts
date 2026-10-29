export default defineEventHandler(async (event) => {
  const {
    apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);
  const body = await readBody(event)

  try {
    const data = await $fetch(`${apiBase}/cart/remove/${query.id}`, {
      method: "DELETE",
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
