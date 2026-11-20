export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه الزامی است',
    });
  }

  const res = await adminApiFetch<any>(event, `/newsletter/${id}/toggle`, {
    method: 'PATCH',
  });

  return res?.data ?? res;
});
