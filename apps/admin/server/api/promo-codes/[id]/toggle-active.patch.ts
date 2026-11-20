export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return adminApiFetch(event, `/promotions/${id}/toggle-active`, {
    method: "PATCH",
  });
});
