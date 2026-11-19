export default defineEventHandler(async (event) => {
  assertMethod(event, "GET");

  return apiFetch(event, "/search/products", {
    query: getQuery(event),
  });
});