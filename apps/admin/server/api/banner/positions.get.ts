export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/banner-positions', {
    method: 'GET',
  });
});
