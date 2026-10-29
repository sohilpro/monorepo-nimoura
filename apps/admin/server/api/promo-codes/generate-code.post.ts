// POST /api/admin/promo-codes/generate-code -> proxies to NestJS: GET /admin/promo-codes/generate-code
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  return adminApiFetch(event, '/promo-codes/generate-code', {
    method: 'GET',
    query: { prefix: body?.prefix },
  });
});
