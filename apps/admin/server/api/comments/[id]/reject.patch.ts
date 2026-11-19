export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه دیدگاه الزامی است',
    });
  }

  return await adminApiFetch(event, `/comments/${id}/reject`, {
    method: 'PATCH',
  });
});
