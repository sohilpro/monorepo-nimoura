// POST /api/admin/promo-codes -> proxies to NestJS: POST /admin/promo-codes
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch(event, "/promo-codes", { method: "POST", body });
});
