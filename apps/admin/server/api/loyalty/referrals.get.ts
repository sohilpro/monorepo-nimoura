export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return adminApiFetch(event, '/admin/loyalty/referrals', {
    method: 'GET',
    query,
  });
});
