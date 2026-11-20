export default defineEventHandler(async (event) => {
  return await apiFetch(event, '/explore/videos/categories');
});
