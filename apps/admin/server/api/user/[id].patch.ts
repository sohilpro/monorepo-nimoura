export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);

  return await adminApiFetch(event, `/users/${id}`, {
    method: 'PATCH',
    body,
  });
});
