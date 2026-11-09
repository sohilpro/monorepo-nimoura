export default defineEventHandler(async (event) =>
  adminApiFetch(event, '/tags/bulk', { method: 'POST', body: await readBody(event) }),
);
