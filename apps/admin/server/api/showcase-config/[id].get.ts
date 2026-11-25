export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const res: any = await adminApiFetch(event, `/showcase-configs/${id}`, { method: 'GET' });
  return res?.data ?? res;
});
