export default defineEventHandler(async (event) => {
  const { id, slug, brandSlug, ...query } = getQuery(event);
  const identifier = slug ?? brandSlug ?? id;

  return await apiFetch(
    event,
    `/products/brand/${encodeURIComponent(String(identifier))}`,
    { query },
  );
});
