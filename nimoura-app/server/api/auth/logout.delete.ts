export default defineEventHandler(async (event) => {
  const token = getCookie(event, "accesstoken");

  try {
    if (token) {
      deleteCookie(event, "accesstoken");
    }

    return {
      success: true,
      message: "از حساب خود خارج شدید.",
    };
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.data?.message || "خطای داخلی سرور",
      })
    );
  }
});
