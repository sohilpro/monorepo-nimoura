export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return adminApiFetch(event, `/magazine/articles/${id}`, {
    method: 'DELETE',
  });
});
