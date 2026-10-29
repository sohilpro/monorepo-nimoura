export default defineEventHandler(async (event) => {
  const {apiBase} = useRuntimeConfig();
  const query = getQuery(event);
  //  const id = getRouterParam(event, "id");

  try {
    const data = await $fetch(`${apiBase}/products/category/${query.categoryId}`, {
      query,
    });

    return data;
  } catch (error) {
    return error;
  }
});
