export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await adminApiFetch(event, '/newsletter/broadcast', {
    method: 'POST',
    body,
  });
});
