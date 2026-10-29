import type { Article, PaginatedResult } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return adminApiFetch<PaginatedResult<Article>>(event, '/magazine/articles/list', {
    query,
  });
});
