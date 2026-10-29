import type { Tag } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return adminApiFetch<Tag>(event, `/magazine/tags/${id}`, { method: 'PATCH', body });
});