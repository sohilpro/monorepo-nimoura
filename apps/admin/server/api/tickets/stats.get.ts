import { adminApiFetch } from '~~/server/utils/adminApiFetch';

export default defineEventHandler(async (event) => {
  return await adminApiFetch(event, '/tickets/stats', {
    method: 'GET',
  });
});
