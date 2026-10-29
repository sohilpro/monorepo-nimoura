import { Author } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  return apiFetch<Author>(event, `/magazine/authors/${slug}`);
});
