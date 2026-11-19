import { apiFetch } from '~~/server/utils/apiFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return await apiFetch(event, `/tickets/${id}`, {
    method: 'GET',
  });
});
