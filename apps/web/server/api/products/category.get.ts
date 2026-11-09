export default defineEventHandler(async (event) => {
  const {apiBase} = useRuntimeConfig();
  const { id, ...query } = getQuery(event);
  // صفحه دسته‌بندی شناسه را با نام id می‌فرستد؛ هر دو نام پشتیبانی می‌شود
  const categoryId = query.categoryId ?? id;

  try {
    const data = await $fetch(`${apiBase}/products/category/${categoryId}`, {
      query,
    });

    return data;
  } catch (error) {
    return error;
  }
});
