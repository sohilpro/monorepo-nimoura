import type { Article } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return adminApiFetch<Article>(event, `/magazine/articles/${id}`, {
    method: 'PATCH',
    body,
  });
});
