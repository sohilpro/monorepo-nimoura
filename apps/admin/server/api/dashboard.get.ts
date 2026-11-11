export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await adminApiFetch(event, '/dashboard', {
    method: 'GET',
    query: query.range ? { range: query.range } : undefined,
  });
});
