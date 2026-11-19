import { adminApiFetch } from '~~/server/utils/adminApiFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return await adminApiFetch(event, `/tickets/${id}/messages`, {
    method: 'POST',
    body,
  });
});
