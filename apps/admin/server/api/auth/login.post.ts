import { UserRole } from "@nimoura/shared-types";

export default defineEventHandler(async (event) => {
  const {
    public: { apiBasePublic },
  } = useRuntimeConfig();

  const body = await readBody(event);
  const rememberMe = Boolean(body?.rememberMe);

  // حذف فیلد کمکی rememberMe قبل از ارسال به بکند
  const loginPayload = {
    username: body?.username,
    password: body?.password,
  };

  try {
    const data: any = await $fetch(`${apiBasePublic}/auth/login`, {
      method: "POST",
      body: loginPayload,
    });

    const user = data?.data?.user;

    // بررسی سفت‌وسخت نقش در سطح سرور: جلوگیری کامل از ورود کاربران عادی
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.OWNER)) {
      throw createError({
        statusCode: 403,
        statusMessage: "دسترسی غیرمجاز: حساب کاربری شما اجازه ورود به پنل مدیریت را ندارد.",
      });
    }

    if (data?.data?.accessToken) {
      // تنظیم مدت زمان کوکی بر اساس انتخاب «مرا به خاطر بسپار»
      const maxAge = rememberMe
        ? 60 * 60 * 24 * 30 // ۳۰ روز در صورت انتخاب مرا به خاطر بسپار
        : 60 * 60 * 24 * 1; // ۱ روز در حالت عادی

      setCookie(event, "accesstoken", data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
    }

    return data;
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: error?.statusCode || 500,
        statusMessage:
          error?.statusMessage ||
          error?.data?.message ||
          "نام کاربری یا رمز عبور اشتباه است.",
      })
    );
  }
});
