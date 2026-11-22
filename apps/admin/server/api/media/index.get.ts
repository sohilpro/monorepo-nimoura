// server/api/media/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await adminApiFetch(event, '/media/list', {
    method: 'GET',
    query,
  });
});
