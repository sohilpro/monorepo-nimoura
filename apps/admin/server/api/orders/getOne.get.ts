export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id || event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه سفارش نامعتبر است',
    });
  }

  return await adminApiFetch(event, `/orders/${id}`, {
    method: 'GET',
  });
});
