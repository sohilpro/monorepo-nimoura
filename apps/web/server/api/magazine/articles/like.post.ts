// POST /api/magazine/articles/:id/like
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  // IP و User-Agent کاربر واقعی را به بک‌اند پاس می‌دهیم تا fingerprint درست ساخته شود
  const forwardedFor = getRequestHeader(event, 'x-forwarded-for');
  const userAgent = getRequestHeader(event, 'user-agent');

  return apiFetch(event, `/magazine/articles/${id}/like`, {
    method: 'POST',
    headers: {
      'x-forwarded-for': forwardedFor || '',
      'user-agent': userAgent || '',
    },
  });
});