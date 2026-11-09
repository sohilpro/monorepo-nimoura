export default defineEventHandler(async (event) =>
  adminApiFetch(event, '/tags/merge', { method: 'POST', body: await readBody(event) }),
);
