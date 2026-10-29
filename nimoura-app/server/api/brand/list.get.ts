export default defineEventHandler(async (event) => {
  const {
     apiBase ,
  } = useRuntimeConfig();

  const query = getQuery(event);

  try {
    const data = await $fetch(`${apiBase}/products/brands/list`, {
      query,
    });

    return data;
  } catch (error) {
    return error;
  }
});
