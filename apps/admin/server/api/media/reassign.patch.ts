// server/api/media/reassign.patch.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await adminApiFetch(event, '/media/reassign-owner', {
    method: 'PATCH',
    body,
  });
});
