// GET /api/magazine/articles?page=1&limit=12&search=...&categorySlug=...

import { Article, PaginatedResult } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return apiFetch<PaginatedResult<Article>>(event, "/magazine/articles", {
    query,
  });
});
