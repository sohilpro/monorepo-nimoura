import { apiFetch } from '~~/server/utils/apiFetch';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await apiFetch(event, '/tickets', {
    method: 'GET',
    query,
  });
});
