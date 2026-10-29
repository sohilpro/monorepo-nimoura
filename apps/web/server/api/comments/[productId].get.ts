export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, "productId");
  const query = getQuery(event);
  const { apiBase } = useRuntimeConfig();

  return await $fetch(`${apiBase}/comments/${productId}`, { query });
});
