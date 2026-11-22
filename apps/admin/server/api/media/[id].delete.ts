// server/api/media/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return await adminApiFetch(event, `/media/${id}`, {
    method: 'DELETE',
  });
});
