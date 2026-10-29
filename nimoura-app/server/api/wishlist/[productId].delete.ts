export default defineEventHandler(async (event) => {
  const token = getCookie(event, "accesstoken");
  const productId = getRouterParam(event, "productId");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "برای حذف از علاقه‌مندی‌ها ابتدا وارد شوید.",
    });
  }

  if (!productId || isNaN(Number(productId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "شناسه محصول نامعتبر است.",
    });
  }

  const { apiBase } = useRuntimeConfig();

  try {
    const response = await $fetch(`${apiBase}/wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage: error?.data?.message || "خطا در حذف از علاقه‌مندی‌ها",
      data: error?.data,
    });
  }
});
