import { Category } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  return apiFetch<Category>(event, `/magazine/categories/${slug}`);
});
