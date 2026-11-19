import { adminApiFetch } from '~~/server/utils/adminApiFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return await adminApiFetch(event, `/tickets/${id}`, {
    method: 'GET',
  });
});
