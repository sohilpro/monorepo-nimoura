// server/api/media/stats.get.ts
export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/media/stats', {
    method: 'GET',
  });
});
