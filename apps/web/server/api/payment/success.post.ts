export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);

  return apiFetch(event, `/orders/${query.id}/payment/success`, {
    method: "POST",
    body,
  });
});

