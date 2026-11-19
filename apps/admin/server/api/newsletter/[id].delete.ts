export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه الزامی است',
    });
  }

  return await adminApiFetch(event, `/newsletter/${id}`, {
    method: 'DELETE',
  });
});
