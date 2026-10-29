import type { Category } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch<Category>(event, '/magazine/categories', {
    method: 'POST',
    body,
  });
});