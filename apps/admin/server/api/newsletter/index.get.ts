export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cleanQuery: Record<string, any> = {};

  if (query.page) cleanQuery.page = query.page;
  if (query.limit) cleanQuery.limit = query.limit;
  if (query.search && query.search !== '') cleanQuery.search = query.search;
  if (query.sortBy && query.sortBy !== 'undefined') cleanQuery.sortBy = query.sortBy;
  if (query.sortOrder && query.sortOrder !== 'undefined') cleanQuery.sortOrder = query.sortOrder;
  if (query.isActive !== undefined && query.isActive !== 'undefined') cleanQuery.isActive = query.isActive;

  const res = await adminApiFetch<any>(event, '/newsletter', {
    method: 'GET',
    query: cleanQuery,
  });

  return res?.data ?? res;
});
