export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return adminApiFetch(event, '/loyalty/users', { method: 'GET', query });
});
