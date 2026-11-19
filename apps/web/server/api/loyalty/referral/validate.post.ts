export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return apiFetch(event, '/loyalty/referral/validate', {
    method: 'POST',
    body,
  });
});
