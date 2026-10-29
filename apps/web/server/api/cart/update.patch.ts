export default defineEventHandler(async (event) => {
  const {
   apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);

  try {
    const data = await $fetch(`${apiBase}/cart/update`, {
      method: "PATCH",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});
