export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");
  const query = getQuery(event);
  
  // برای تست می‌توانید ببینید چی چاپ می‌شود (فقط در ترمینال سرور نمایش داده می‌شود و امن است)
  console.log("Admin API Base:", config.apiBase);

  try {
    // نام ماژول (مثلاً magazine) باید اینجا اضافه شود تا با NestJS همخوانی داشته باشد
    const data = await $fetch(`${config.apiBase}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      query,
    });

    return data;
  } catch (error: any) {
    // بازگرداندن خطای مناسب به جای کرش کردن
    throw createError({
      statusCode: error?.response?.status || 500,
      statusMessage: error?.message || 'Internal Server Error',
      data: error?.data,
    });
  }
});