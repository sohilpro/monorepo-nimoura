export default defineEventHandler(async (event) => {
  return apiFetch(event, '/loyalty/visits/check-in', { method: 'POST' });
});
