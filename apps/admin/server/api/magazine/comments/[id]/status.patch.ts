export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event); // { status: 'approved' | 'rejected' }
  return adminApiFetch(event, `/magazine/comments/${id}/status`, {
    method: 'PATCH',
    body,
  });
});