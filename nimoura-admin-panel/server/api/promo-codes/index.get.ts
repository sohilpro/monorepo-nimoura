// GET /api/admin/promo-codes  -> proxies to NestJS: GET /admin/promo-codes
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return adminApiFetch(event, "/promo-codes", { method: "GET", query });
});
