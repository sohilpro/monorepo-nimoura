export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = event.context.params?.id || query.id;

  return await adminApiFetch(event, `/brands/${id}`, {
    method: 'DELETE',
  });
});