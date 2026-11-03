export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = event.context.params?.id || query.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه کاربر الزامی است',
    });
  }

  return await adminApiFetch(event, `/users/${id}`, {
    method: 'DELETE',
  });
});
