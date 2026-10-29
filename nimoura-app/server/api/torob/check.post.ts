import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const storage = useStorage(); // دسترسی به حافظه موقت ناکست
  const STORAGE_KEY = "cache:torob_token"; // یک کلید برای ذخیره

  // ۱. خواندن بادی درخواست
  const body = await readBody(event);
  const amount = body.amount;
  const baseUrl = "https://cpg.torobpay.com/api/online";

  // ۲. تلاش برای دریافت توکن از کش (حافظه)
  let accessToken = null;
  const cachedData: any = await storage.getItem(STORAGE_KEY);
  const currentTime = Date.now();

  // اگر توکن هست و زمان انقضایش هنوز نرسیده (با ۶۰ ثانیه اطمینان)
  if (cachedData && cachedData.expiry > currentTime + 60000) {
    console.log("Using Cached Torob Token ✅");
    accessToken = cachedData.token;
  } else {
    // ۳. اگر توکن نیست یا منقضی شده، درخواست جدید می‌زنیم
    console.log("Fetching New Torob Token 🔄");

    const basicAuth = Buffer.from(
      `${config.torobClientId}:${config.torobClientSecret}`
    ).toString("base64");

    try {
      const tokenResponse: any = await $fetch(`${baseUrl}/v1/oauth/token`, {
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

      if (!tokenResponse?.access_token) {
        throw new Error("توکن دریافت نشد");
      }

      accessToken = tokenResponse.access_token;

      // ۴. ذخیره توکن جدید در حافظه
      // expires_in معمولا ثانیه است، ضربدر ۱۰۰۰ می‌کنیم تا میلی‌ثانیه شود
      const expiryTime = currentTime + tokenResponse.expires_in * 1000;

      await storage.setItem(STORAGE_KEY, {
        token: accessToken,
        expiry: expiryTime,
      });
    } catch (error) {
      throw createError({ statusCode: 500, message: "خطا در دریافت توکن" });
    }
  }

  // ۵. استفاده از توکن (چه کش شده، چه جدید) برای بررسی اعتبار
  try {
    const eligibilityResponse = await $fetch(`${baseUrl}/offer/v1/eligible`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // استفاده از توکن
        "Content-Type": "application/json",
      },
      params: {
        amount: amount.toString(),
      },
    });

    return eligibilityResponse;
  } catch (error: any) {
    // اگر به هر دلیلی توکن نامعتبر بود (مثلا سمت ترب ریست شده بود)
    // بهتر است کش را پاک کنیم تا دفعه بعد توکن جدید بگیرد
    if (error.response?.status === 401) {
      await storage.removeItem(STORAGE_KEY);
    }

    throw createError({
      statusCode: error.response?.status || 500,
      message: "خطا در بررسی اعتبار ترب",
      data: error.data,
    });
  }
});
