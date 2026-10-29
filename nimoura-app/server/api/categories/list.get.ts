export default defineEventHandler(async (event) => {
  const {
    apiBase ,
  } = useRuntimeConfig();

  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/categories`, {
      query,
    });

    return data;
  } catch (error) {
    return error;
  }
});
