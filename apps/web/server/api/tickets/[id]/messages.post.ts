import { apiFetch } from '~~/server/utils/apiFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return await apiFetch(event, `/tickets/${id}/messages`, {
    method: 'POST',
    body,
  });
});
