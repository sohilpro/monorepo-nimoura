export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch(event, '/loyalty/settings', { method: 'PATCH', body });
});
