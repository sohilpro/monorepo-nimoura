export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  
  return await adminApiFetch(event, `/products/${id}`, {
    method: 'DELETE',
  });
});