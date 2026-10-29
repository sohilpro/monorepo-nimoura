// server/api/payment/torob/callback.post.ts
import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const storage = useStorage();
  const token = getCookie(event, "accesstoken");

  // ورودی‌های مورد نیاز از کلاینت
  const { paymentToken, orderId } = body;

  if (!paymentToken || !orderId) {
    throw createError({ statusCode: 400, message: "اطلاعات پرداخت ناقص است" });
  }

  const torobBaseUrl = "https://cpg.torobpay.com/api/online";

  // آدرس بک‌اند اصلی شما (NestJS)
  // اگر روی داکر هستید نام سرویس، اگر لوکال هستید localhost
  const backendApiUrl = config.apiBase || "http://localhost:3000";

  // --- مرحله ۱: دریافت اکسس توکن (کپی از لاجیک قبلی) ---
  const STORAGE_KEY = "cache:torob_token";
  let accessToken: string | null = null;
  const cachedData: any = await storage.getItem(STORAGE_KEY);

  if (cachedData && cachedData.expiry > Date.now() + 60000) {
    accessToken = cachedData.token;
  } else {
    // دریافت توکن جدید
    const basicAuth = Buffer.from(
      `${config.torobClientId}:${config.torobClientSecret}`
    ).toString("base64");
    try {
      const tokenRes: any = await $fetch(`${torobBaseUrl}/v1/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: {
          username: config.torobUsername,
          password: config.torobPassword,
        },
      });
      accessToken = tokenRes.access_token;
      await storage.setItem(STORAGE_KEY, {
        token: accessToken,
        expiry: Date.now() + tokenRes.expires_in * 1000,
      });
    } catch (e) {
      throw createError({
        statusCode: 500,
        message: "خطا در دریافت توکن دسترسی",
      });
    }
  }

  try {
    // --- مرحله ۲: استعلام وضعیت (Status Check) ---
    const statusData: any = await $fetch(`${torobBaseUrl}/payment/v1/status`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      query: { paymentToken },
    });

    if (!statusData || !statusData.successful || !statusData.response) {
      throw new Error("استعلام وضعیت نامعتبر بود");
    }

    const gatewayStatus = statusData.response.status;

    // --- مرحله ۳: بررسی و تایید نهایی (Verify) ---
    if (
      gatewayStatus === "SETTLE" ||
      gatewayStatus === "VERIFY" ||
      gatewayStatus === "PENDING"
    ) {
      // بسته به داکیومنت ترب

      // درخواست وریفای به ترب
      const verifyData: any = await $fetch(
        `${torobBaseUrl}/payment/v1/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: { paymentToken },
        }
      );

      if (verifyData && verifyData.successful) {
        const refId = verifyData.response?.transactionId || "NO_REF";

        await $fetch(`${torobBaseUrl}/payment/v1/settle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: { paymentToken },
        });
        // --- مرحله ۴: ثبت موفقیت در دیتابیس (NestJS) ---
        // به اندپوینت کنترلر خودتان درخواست می‌زنیم
        try {
          const data = await $fetch(
            `${backendApiUrl}/orders/${orderId}/payment/success`,
            {
              method: "POST",
              body: { refId, method: "torobpay" },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(data);
        } catch (dbError) {
          console.error("DB Update Failed:", dbError);
          // حتی اگر این خطا داد، چون پول کم شده، به کاربر موفقیت نشان می‌دهیم
          // اما باید لاگ شود که دستی چک کنید
        }

        return { success: true, transactionId: refId };
      }
    }

    // --- اگر به اینجا رسید یعنی پرداخت ناموفق بوده ---
    // ثبت شکست در دیتابیس
    await $fetch(`${backendApiUrl}/orders/${orderId}/payment/failure`, {
      method: "POST",
      body: { method: "torobpay" },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(console.error);

    return { success: false, message: "پرداخت تایید نشد یا لغو شده است." };
  } catch (error: any) {
    console.error("Callback Process Error:", error);
    // ثبت خطا در دیتابیس
    await $fetch(`${backendApiUrl}/orders/${orderId}/payment/failure`, {
      method: "POST",
      body: { method: "torobpay" },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(console.error);

    return { success: false, message: error.message || "خطا در پردازش تراکنش" };
  }
});
