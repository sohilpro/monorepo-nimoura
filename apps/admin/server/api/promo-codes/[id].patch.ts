export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return adminApiFetch(event, `/promo-codes/${id}`, { method: 'PATCH', body });
});
