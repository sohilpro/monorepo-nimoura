export default defineEventHandler(async (event) => {
  const res = await adminApiFetch<any>(event, '/newsletter/stats', {
    method: 'GET',
  });

  return res?.data ?? res;
});
