export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/orders/statistics', {
    method: 'GET',
  });
});
