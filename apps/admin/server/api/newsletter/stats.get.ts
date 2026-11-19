export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/newsletter/stats', {
    method: 'GET',
  });
});
