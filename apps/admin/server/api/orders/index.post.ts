export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await adminApiFetch(event, '/orders', {
    method: 'POST',
    body,
  });
});
