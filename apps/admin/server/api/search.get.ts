export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const q = String(query.q || '').trim();

  if (!q || q.length < 2) {
    return {
      success: true,
      data: {
        products: [],
        orders: [],
        users: [],
      },
    };
  }

  const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
    adminApiFetch<any>(event, '/products', {
      method: 'GET',
      query: { search: q, limit: 4 },
    }),
    adminApiFetch<any>(event, '/orders', {
      method: 'GET',
      query: { search: q, limit: 4 },
    }),
    adminApiFetch<any>(event, '/users', {
      method: 'GET',
      query: { search: q, limit: 4 },
    }),
  ]);

  const extractData = (res: PromiseSettledResult<any>) => {
    if (res.status !== 'fulfilled') return [];
    const val = res.value?.data ?? res.value;
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.items)) return val.items;
    if (Array.isArray(val?.products)) return val.products;
    if (Array.isArray(val?.orders)) return val.orders;
    if (Array.isArray(val?.users)) return val.users;
    return [];
  };

  return {
    success: true,
    data: {
      products: extractData(productsRes),
      orders: extractData(ordersRes),
      users: extractData(usersRes),
    },
  };
});
