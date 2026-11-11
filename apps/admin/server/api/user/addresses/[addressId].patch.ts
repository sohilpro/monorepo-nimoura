export default defineEventHandler(async (event) => {
  const addressId = getRouterParam(event, 'addressId');
  if (!addressId) throw createError({ statusCode: 400, statusMessage: 'شناسه آدرس الزامی است' });
  const body = await readBody(event);

  return await adminApiFetch(event, `/addresses/${addressId}`, {
    method: 'PATCH',
    body,
  });
});
