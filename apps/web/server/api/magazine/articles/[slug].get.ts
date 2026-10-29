import { Article } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  return apiFetch<{ article: Article; related: Article[] }>(
    event,
    `/magazine/articles/${slug}`,
  );
});