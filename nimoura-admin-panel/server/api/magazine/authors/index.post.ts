import type { Author } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch<Author>(event, '/magazine/authors', { method: 'POST', body });
});