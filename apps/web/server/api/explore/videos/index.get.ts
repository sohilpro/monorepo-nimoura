export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await apiFetch(event, '/explore/videos', {
    query,
  });
});
