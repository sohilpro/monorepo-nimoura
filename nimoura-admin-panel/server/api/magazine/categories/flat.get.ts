import type { Category } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  return apiFetch<Category[]>(event, "/magazine/categories");
});
