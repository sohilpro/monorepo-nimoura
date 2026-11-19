export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await adminApiFetch(event, '/newsletter', {
    method: 'GET',
    query,
  });
});
