export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id || event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه بنر الزامی است',
    });
  }

  return await adminApiFetch(event, `/banners/${id}`, {
    method: 'DELETE',
  });
});
