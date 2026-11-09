export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'شناسه گروه الزامی است' });
  return adminApiFetch(event, `/tags/groups/${id}`, { method: 'PATCH', body: await readBody(event) });
});
