export default defineEventHandler(async (event) => {
  return apiFetch(event, "/payments/verify", {
    query: getQuery(event),
  });
});

