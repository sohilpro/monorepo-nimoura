export default defineEventHandler(async (event) => {
  const {
  apiBase 
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);

  try {
    const data = await $fetch(`${apiBase}/user/profile`, {
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
