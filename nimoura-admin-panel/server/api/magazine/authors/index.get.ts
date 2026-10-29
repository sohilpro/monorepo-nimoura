import type { Author } from '~~/server/types/magazine';

export default defineEventHandler(async (event) => {
  return adminApiFetch<Author[]>(event, '/magazine/authors');
});