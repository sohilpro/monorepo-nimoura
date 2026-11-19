export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return adminApiFetch(event, '/loyalty/ledger', { method: 'GET', query });
});
