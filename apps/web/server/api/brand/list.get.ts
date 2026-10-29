export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await apiFetch(event, '/products/brands/list', { query });
});
