import { Comment } from "~~/server/types/magazine";


export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return apiFetch<Comment[]>(event, '/magazine/comments', { query });
});