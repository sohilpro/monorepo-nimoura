export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await apiFetch(event, '/brands', {
    method: 'GET',
    query,
  });
});