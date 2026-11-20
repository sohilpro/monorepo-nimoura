export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return apiFetch(event, '/payments/create', {
    method: 'POST',
    body,
  });
});
