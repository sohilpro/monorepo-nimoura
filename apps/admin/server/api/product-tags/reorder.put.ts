export default defineEventHandler(async (event) =>
  adminApiFetch(event, '/tags/reorder', { method: 'PUT', body: await readBody(event) }),
);
