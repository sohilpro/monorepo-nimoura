export default defineEventHandler(async (event) => {
  return adminApiFetch(event, '/loyalty/settings', { method: 'GET' });
});
