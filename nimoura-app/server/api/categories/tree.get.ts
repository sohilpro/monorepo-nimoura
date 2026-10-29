export default defineEventHandler(async (event) => {
  const {
   apiBase ,
  } = useRuntimeConfig();

  try {
    const data = await $fetch(`${apiBase}/categories/tree`);

    return data;
  } catch (error) {
    return error;
  }
});
