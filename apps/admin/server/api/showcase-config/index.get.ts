export default defineEventHandler(async (event) => {
  const res: any = await adminApiFetch(event, '/showcase-configs', { method: 'GET' });
  return res?.data ?? res;
});
