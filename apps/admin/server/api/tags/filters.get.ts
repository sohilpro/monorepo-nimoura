export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/tags/groups', {
    method: 'GET',
    query: getQuery(event),
  }).catch(() => []);
});
