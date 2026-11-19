export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return apiFetch(event, '/newsletter/subscribe', {
    method: 'POST',
    body,
  });
});
