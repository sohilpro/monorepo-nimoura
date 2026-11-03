export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = event.context.params?.id || query.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه برند الزامی است',
    });
  }

  return await adminApiFetch(event, `/brands/${id}`, {
    method: 'GET',
  });
});
