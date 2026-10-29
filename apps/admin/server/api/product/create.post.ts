export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await adminApiFetch(event, '/products', {
    method: 'POST',
    body,
  });
});
