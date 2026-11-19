export default defineEventHandler(async (event) => {
  return apiFetch(event, '/loyalty/summary', { method: 'GET' });
});
