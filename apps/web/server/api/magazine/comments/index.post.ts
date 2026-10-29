export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.name || !body?.email || !body?.content || !body?.articleId) {
    throw createError({
      statusCode: 400,
      statusMessage: "اطلاعات نظر ناقص است",
    });
  }

  return apiFetch(event, "/magazine/comments", {
    method: "POST",
    body,
  });
});
