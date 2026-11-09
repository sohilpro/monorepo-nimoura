export default defineEventHandler(async (event) =>
  adminApiFetch(event, '/tags', { method: 'POST', body: await readBody(event) }),
);
