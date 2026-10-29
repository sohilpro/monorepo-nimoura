export default defineEventHandler(async (event) => {
  const token = getCookie(event, "accesstoken");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "برای مشاهده علاقه‌مندی‌ها ابتدا وارد شوید.",
    });
  }

  const { apiBase } = useRuntimeConfig();

  try {
    const response = await $fetch(`${apiBase}/wishlist`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || "خطا در دریافت لیست علاقه‌مندی‌ها",
      data: error?.data,
    });
  }
});
