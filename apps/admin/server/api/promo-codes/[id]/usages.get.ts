export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const query = getQuery(event);
  try {
    return await adminApiFetch(event, `/promotions/${id}/usages`, {
      method: "GET",
      query,
    });
  } catch {
    return {
      success: true,
      data: {
        items: [],
        total: 0,
        page: Number(query.page || 1),
        limit: Number(query.limit || 20),
      },
    };
  }
});
