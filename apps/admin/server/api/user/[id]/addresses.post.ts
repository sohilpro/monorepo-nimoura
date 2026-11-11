export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'شناسه کاربر الزامی است' });
  const body = await readBody(event);

  return await adminApiFetch(event, `/addresses/user/${id}`, {
    method: 'POST',
    body,
  });
});
