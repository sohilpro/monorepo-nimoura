export default defineEventHandler(async (event) => {
  const {
  apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");

  try {
    const data = await $fetch(`${apiBase}/cart/clear`, {
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
