export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه بنر الزامی است',
    });
  }

  return await apiFetch(event, `/banners/${id}/view`, {
    method: 'POST',
  });
});
