export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return adminApiFetch(event, `/magazine/tags/${id}`, { method: "DELETE" });
});
