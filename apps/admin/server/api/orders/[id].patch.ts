export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);

  return await adminApiFetch(event, `/orders/${id}`, {
    method: 'PATCH',
    body,
  });
});
