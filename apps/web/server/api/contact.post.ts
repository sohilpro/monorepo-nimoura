import { apiFetch } from '~~/server/utils/apiFetch';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await apiFetch(event, '/tickets/contact', {
    method: 'POST',
    body,
  });
});
