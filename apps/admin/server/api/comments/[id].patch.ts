export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه دیدگاه الزامی است',
    });
  }

  return await adminApiFetch(event, `/comments/${id}`, {
    method: 'PATCH',
    body,
  });
});
