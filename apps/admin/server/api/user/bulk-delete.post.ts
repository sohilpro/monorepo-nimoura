export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await adminApiFetch(event, '/users/bulk-delete', {
    method: 'POST',
    body,
  });
});
