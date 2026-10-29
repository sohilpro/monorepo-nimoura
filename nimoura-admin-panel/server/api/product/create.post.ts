// server/api/admin/products/create.ts
export default defineEventHandler(async (event) => {
  // ۱. خواندن بدنه درخواست به صورت JSON خالص که از فرانت‌اند ارسال شده است
  const body = await readBody(event);

  try {
    // ۲. استفاده از utility قدرتمند adminApiFetch برای مدیریت خودکار توکن، baseURL و خطاها
    const response: any = await adminApiFetch(event, '/products', {
      method: 'POST',
      body: body,
    });

    return response;
  } catch (error: any) {
    // خطاهای برگشتی از adminApiFetch خودشون به صورت H3Error استاندارد پرتاب میشن
    // اما برای اطمینان از پاس دادن دقیق data (مثل خطاهای ولیدیشن بک‌اند) این بخش را حفظ می‌کنیم:
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'خطا در ارتباط با سرور برای ایجاد محصول',
      data: error?.data,
    });
  }
});