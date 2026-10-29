export default defineEventHandler(async (event) => {
  const {
     apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/orders/${query.id}/invoice`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});
