export default defineEventHandler(async (event) => {
  const {
   apiBase ,
  } = useRuntimeConfig();
  const token = getCookie(event, "accesstoken");
  const body = await readBody(event);

  try {
    const data = await $fetch(`${apiBase}/payment/create`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body,
    });

    return data;
  } catch (error) {
    console.log(error.data);
    
    return error;
  }
});
