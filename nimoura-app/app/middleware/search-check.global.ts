export default defineNuxtRouteMiddleware((to) => {
  if (to.name === "search" && !to.query.q) {
    return createError({
      statusCode: 404,
      statusMessage: "صفحه مورد نظر یافت نشد",
    });
  }
});
