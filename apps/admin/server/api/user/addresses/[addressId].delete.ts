export default defineEventHandler(async (event) => {
  const addressId = getRouterParam(event, 'addressId');
  if (!addressId) throw createError({ statusCode: 400, statusMessage: 'شناسه آدرس الزامی است' });

  return await adminApiFetch(event, `/addresses/${addressId}`, {
    method: 'DELETE',
  });
});
