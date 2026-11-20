export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cleanQuery: Record<string, any> = {};

  if (query.page) cleanQuery.page = query.page;
  if (query.limit) cleanQuery.limit = query.limit;
  if (query.search && String(query.search).trim() !== '') {
    cleanQuery.search = String(query.search).trim();
  }

  const sortVal = query.sortBy || query.sort;
  if (sortVal && sortVal !== 'undefined') {
    cleanQuery.sortBy = sortVal;
  }

  if (query.sortOrder && query.sortOrder !== 'undefined') {
    cleanQuery.sortOrder = query.sortOrder;
  }

  if (query.status && query.status !== 'undefined' && query.status !== '') {
    cleanQuery.status = query.status;
  }

  const res = await adminApiFetch<any>(event, '/comments', {
    method: 'GET',
    query: cleanQuery,
  });

  return res?.data ?? res;
});
