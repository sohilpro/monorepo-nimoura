export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);

  return await apiFetch(event, `/explore/videos/${id}/comments`, {
    query,
  });
});
