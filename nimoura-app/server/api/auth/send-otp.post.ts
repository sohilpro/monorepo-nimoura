export default defineEventHandler(async (event) => {
  const {
     apiBase ,
  } = useRuntimeConfig();
  const body = await readBody(event);

  try {
    const data = await $fetch(`${apiBase}/auth/send-otp`, {
      method: "POST",
      body,
    });

    return data;
  } catch (error) {
    return error;
  }
});
