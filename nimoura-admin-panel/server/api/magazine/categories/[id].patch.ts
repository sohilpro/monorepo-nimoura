import type { Category } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return adminApiFetch<Category>(event, `/magazine/categories/${id}`, {
    method: 'PATCH',
    body,
  });
});