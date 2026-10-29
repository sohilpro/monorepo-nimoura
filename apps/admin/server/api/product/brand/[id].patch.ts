export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = event.context.params?.id || query.id;
  const body = await readBody(event);

  return await adminApiFetch(event, `/brands/${id}`, {
    method: 'PATCH',
    body,
  });
});