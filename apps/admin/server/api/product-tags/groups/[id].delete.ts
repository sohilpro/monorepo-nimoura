export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'شناسه گروه الزامی است' });
  return adminApiFetch(event, `/tags/groups/${id}`, { method: 'DELETE' });
});
