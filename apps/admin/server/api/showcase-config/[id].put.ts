export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return await adminApiFetch(event, `/showcase-configs/${id}`, { method: 'PUT', body });
});
