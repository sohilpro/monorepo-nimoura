export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  return await apiFetch(event, `/explore/videos/${id}/comments`, {
    method: 'POST',
    body,
  });
});
