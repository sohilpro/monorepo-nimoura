import { Tag } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  return apiFetch<Tag[]>(event, "/magazine/tags");
});
