export default defineEventHandler(async (event) => {
  const {
 apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");

  if (!token) {
    return null;
  }
  try {
    const data = await $fetch(`${apiBase}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
});
