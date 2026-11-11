export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'شناسه کاربر الزامی است' });

  return await adminApiFetch(event, `/addresses/user/${id}`, {
    method: 'GET',
    query: getQuery(event),
  });
});
