export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return await adminApiFetch(event, `/banner-positions/${id}`, {
    method: 'PUT',
    body,
  });
});
