export default defineEventHandler((event) =>
  adminApiFetch(event, '/tags', { method: 'GET', query: getQuery(event) }),
);
