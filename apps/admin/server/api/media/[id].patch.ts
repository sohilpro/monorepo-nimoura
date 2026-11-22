// server/api/media/[id].patch.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return await adminApiFetch(event, `/media/${id}`, {
    method: 'PATCH',
    body,
  });
});
