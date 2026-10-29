import type { Article } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch<Article>(event, '/magazine/articles', {
    method: 'POST',
    body,
  });
});
