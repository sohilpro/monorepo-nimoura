export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await adminApiFetch(event, '/orders', {
    method: 'GET',
    query,
  });
});
