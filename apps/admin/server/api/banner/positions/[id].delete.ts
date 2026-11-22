export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return await adminApiFetch(event, `/banner-positions/${id}`, {
    method: 'DELETE',
  });
});
