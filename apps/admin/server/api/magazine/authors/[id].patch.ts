import type { Author } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return adminApiFetch<Author>(event, `/magazine/authors/${id}`, { method: 'PATCH', body });
});