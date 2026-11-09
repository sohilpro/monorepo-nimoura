export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'شناسه تگ الزامی است' });
  return adminApiFetch(event, `/tags/${id}`, { method: 'PATCH', body: await readBody(event) });
});
