export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return adminApiFetch(event, `/loyalty/withdrawals/${id}`, {
    method: 'PATCH',
    body,
  });
});
