export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch(event, '/loyalty/adjustments', { method: 'POST', body });
});
