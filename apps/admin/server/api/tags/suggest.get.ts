export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/tags', {
    method: 'GET',
    query: getQuery(event),
  }).catch(() => []);
});
