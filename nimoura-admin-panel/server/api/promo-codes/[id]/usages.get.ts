export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const query = getQuery(event);
  return adminApiFetch(event, `/promo-codes/${id}/usages`, {
    method: "GET",
    query,
  });
});
