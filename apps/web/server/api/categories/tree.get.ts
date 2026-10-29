export default defineEventHandler(async (event) => {
  return await apiFetch(event, '/categories/tree');
});
