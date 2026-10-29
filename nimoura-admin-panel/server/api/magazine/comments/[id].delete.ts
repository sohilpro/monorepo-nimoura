export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return adminApiFetch(event, `/magazine/comments/${id}`, { method: "DELETE" });
});
