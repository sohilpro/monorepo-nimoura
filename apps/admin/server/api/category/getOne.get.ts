export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id || event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه دسته‌بندی الزامی است',
    });
  }

  return await adminApiFetch(event, `/categories/${id}`, {
    method: 'GET',
  });
});
