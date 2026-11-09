export default defineEventHandler(async (event) =>
  adminApiFetch(event, '/tags/groups', { method: 'POST', body: await readBody(event) }),
);
