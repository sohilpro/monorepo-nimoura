export default defineEventHandler(async (event) => {
  return apiFetch(event, '/loyalty/referral/info', { method: 'GET' });
});
