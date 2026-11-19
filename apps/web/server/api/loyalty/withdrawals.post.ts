export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return apiFetch(event, '/loyalty/withdrawals', { method: 'POST', body });
});
