export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return apiFetch(event, "/payment/create", {
    method: "POST",
    body,
  });
});

