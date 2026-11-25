export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return await adminApiFetch(event, `/showcase-configs/${id}`, { method: 'DELETE' });
});
