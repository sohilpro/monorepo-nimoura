export default defineEventHandler(async (event) =>
  adminApiFetch(event, '/tags/groups/reorder', { method: 'PUT', body: await readBody(event) }),
);
