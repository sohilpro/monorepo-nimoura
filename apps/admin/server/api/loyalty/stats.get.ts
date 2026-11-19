export default defineEventHandler(async (event) => {
  return adminApiFetch(event, '/loyalty/stats', { method: 'GET' });
});
