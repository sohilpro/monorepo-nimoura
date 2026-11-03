export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await adminApiFetch(event, '/brands', {
    method: 'GET',
    query,
  });
});
