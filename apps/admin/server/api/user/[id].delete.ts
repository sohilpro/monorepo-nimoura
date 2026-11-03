export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  return await adminApiFetch(event, `/users/${id}`, {
    method: 'DELETE',
  });
});
