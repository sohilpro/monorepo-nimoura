import type { Tag } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return adminApiFetch<Tag>(event, "/magazine/tags", { method: "POST", body });
});
