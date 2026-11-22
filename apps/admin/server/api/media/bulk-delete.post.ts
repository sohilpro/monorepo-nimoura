// server/api/media/bulk-delete.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await adminApiFetch(event, '/media/bulk-delete', {
    method: 'POST',
    body,
  });
});
