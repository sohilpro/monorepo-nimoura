export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cleanQuery: Record<string, any> = {};

  if (query.page) cleanQuery.page = query.page;
  if (query.limit) cleanQuery.limit = query.limit;
  if (query.search && String(query.search).trim() !== "") {
    cleanQuery.search = String(query.search).trim();
  }
  if (query.positionId) cleanQuery.positionId = query.positionId;
  if (query.status && query.status !== "" && query.status !== "undefined") {
    cleanQuery.status = query.status;
  }
  if (query.device && query.device !== "" && query.device !== "undefined") {
    cleanQuery.device = query.device;
  }

  const sortField = query.sortBy || query.sort;
  if (sortField && sortField !== "undefined") {
    cleanQuery.sortBy = sortField;
  }

  const sortDirection = query.sortDir || query.sortOrder;
  if (sortDirection && sortDirection !== "undefined") {
    cleanQuery.sortDir = String(sortDirection).toUpperCase();
  }

  const res = await adminApiFetch<any>(event, "/banners", {
    method: "GET",
    query: cleanQuery,
  });

  return res?.data ?? res;
});
