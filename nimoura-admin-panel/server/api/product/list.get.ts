export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await adminApiFetch(event, "/products", {
    method: "GET",
    query,
  });
});
