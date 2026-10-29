export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return adminApiFetch(event, `/magazine/categories/${id}`, { method: 'DELETE' });
});