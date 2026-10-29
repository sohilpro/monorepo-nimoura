import type { CommentAdmin, PaginatedResult } from "~~/server/types/magazine";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return adminApiFetch<PaginatedResult<CommentAdmin>>(
    event,
    "/magazine/comments",
    {
      query,
    },
  );
});
