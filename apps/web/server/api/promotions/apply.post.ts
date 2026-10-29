export default defineEventHandler(async (event) => {
  const {
    apiBase 
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);
  
  try {
    const data = await $fetch(`${apiBase}/promotions/apply-discount`, {
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
