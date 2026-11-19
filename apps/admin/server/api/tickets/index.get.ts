import { adminApiFetch } from '~~/server/utils/adminApiFetch';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await adminApiFetch(event, '/tickets', {
    method: 'GET',
    query,
  });
});
