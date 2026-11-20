export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  return await apiFetch(event, `/explore/videos/${id}/like`, {
    method: 'POST',
  });
});
