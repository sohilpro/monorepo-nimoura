export default defineEventHandler(async (event) => {
  const {
     apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);
  const body = await readBody(event);

  try {
    const data = await $fetch(`${apiBase}/orders/${query.id}/payment/success`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body,
    });

    return data;
  } catch (error) {
    return error;
  }
});
