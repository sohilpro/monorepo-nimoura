export default defineEventHandler(async (event) => {
  assertMethod(event, "GET");

  const query = getQuery(event);
  const { apiBase } = useRuntimeConfig();

  try {
    const response = await $fetch(`${apiBase}/search/quick`, {
      method: "GET",
      query,
    });

    return response;
  } catch (error: any) {
    console.error(
      "[search/quick] backend error:",
      error?.data || error?.message || error,
    );

    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 500,
      statusMessage:
        error?.data?.message || error?.message || "جستجو با خطا مواجه شد",
      data: error?.data,
    });
  }
});
