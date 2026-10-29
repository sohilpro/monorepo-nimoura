import type { Article } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return adminApiFetch<Article>(event, `/magazine/articles/${id}`);
});
