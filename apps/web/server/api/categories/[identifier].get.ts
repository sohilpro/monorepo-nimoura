export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'identifier') || '';
  return await apiFetch(
    event,
    `/categories/${encodeURIComponent(identifier)}`,
  );
});
