export default defineEventHandler(async (event) => {
  return apiFetch(event, "/payment/verify", {
    query: getQuery(event),
  });
});

