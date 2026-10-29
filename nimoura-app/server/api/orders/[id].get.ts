export default defineEventHandler(async (event) => {
  const {
    apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const id = getRouterParam(event, "id");

  try {
    const data = await $fetch(`${apiBase}/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});
