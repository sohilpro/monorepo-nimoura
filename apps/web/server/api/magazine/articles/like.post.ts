// POST /api/magazine/articles/like
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event).catch(() => ({}));
  const id = getRouterParam(event, 'id') || query.id || body?.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'شناسه مقاله الزامی است' });
  }

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