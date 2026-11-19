export default defineEventHandler(async (event) => {
  return apiFetch(event, '/loyalty/withdrawals', { method: 'GET' });
});
