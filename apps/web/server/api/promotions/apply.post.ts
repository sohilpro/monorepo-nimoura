export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return apiFetch(event, "/promotions/apply-discount", {
    method: "POST",
    body,
  });
});

