export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return adminApiFetch(event, `/promo-codes/${id}`, { method: 'GET' });
});
