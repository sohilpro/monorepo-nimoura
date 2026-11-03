export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  return await adminApiFetch(event, `/orders/${id}`, {
    method: 'DELETE',
  });
});
