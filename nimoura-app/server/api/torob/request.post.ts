// server/api/payment/torob/request.post.ts
import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const storage = useStorage();

  // ورودی‌های مورد نیاز از فرانت
  // cartItems: لیست محصولات
  // totalPrice: قیمت کل
  // orderId: شناسه سفارش در دیتابیس شما (برای transactionId)
  const { cartItems, totalPrice, orderId } = body;

  const baseUrl = "https://cpg.torobpay.com/api/online";

  // --- مرحله ۱: دریافت توکن (با استفاده از سیستم کش که قبلا ساختیم) ---
  const STORAGE_KEY = "cache:torob_token";
  let accessToken: string | null = null;
  const cachedData: any = await storage.getItem(STORAGE_KEY);

  // آیا توکن معتبر در کش داریم؟
  if (cachedData && cachedData.expiry > Date.now() + 60000) {
    accessToken = cachedData.token;
  } else {
    // دریافت توکن جدید
    const basicAuth = Buffer.from(
      `${config.torobClientId}:${config.torobClientSecret}`
    ).toString("base64");
    try {
      const tokenRes: any = await $fetch(`${baseUrl}/v1/oauth/token`, {
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
      // ذخیره در کش
      await storage.setItem(STORAGE_KEY, {
        token: accessToken,
        expiry: Date.now() + tokenRes.expires_in * 1000,
      });
    } catch (e) {
      throw createError({ statusCode: 500, message: "خطا در دریافت توکن ترب" });
    }
  }

  // --- مرحله ۲: مپ کردن آیتم‌ها (لاجیک شما منتقل شد به اینجا) ---
  const innerCartItems = cartItems.map((item: any) => {
    // محاسبه قیمت نهایی (با کسر تخفیف)
    // نکته: اگر آیتم‌ها را از دیتابیس بخوانید امنیت ۱۰۰٪ می‌شود
    const finalPrice =
      item.priceDiscount > 0 ? item.price - item.priceDiscount : item.price;

    return {
      id: item.id,
      name: item.title,
      price: finalPrice,
      count: item.quantity,
      sku: item.sku || item.id,
      image: item.thumbnail, // اختیاری
      amount: finalPrice, // ترب معمولا مبلغ کل آیتم (price * count) را در فیلد جداگانه نمی‌خواهد، اما اگر در داکیومنت هست بگذارید
    };
  });

  // --- مرحله ۳: ساخت بادی درخواست ---
  // آدرس بازگشت (در پروداکشن باید آدرس سایت واقعی باشد)
  // هدر Origin را می‌خوانیم تا آدرس داینامیک باشد (لوکال یا سرور)
  const origin = getRequestHeader(event, "origin") || "https://nimoura.shop";

  const torobBody = {
    amount: String(Number(totalPrice) * 10), // تبدیل به ریال؟ (طبق کد شما * 10 شده)
    paymentMethodTypeDto: "ONLINE_CREDIT",
    returnURL: `${origin}/payment/callback/torobpay`,
    transactionId: orderId ? `ORD-${orderId}` : `nrm-${Date.now()}`, // ترجیحا از ID واقعی سفارش استفاده کنید
    cartList: [
      {
        cartId: "1",
        totalAmount: totalPrice,
        cartItems: innerCartItems,
      },
    ],
  };

  // --- مرحله ۴: ارسال به ترب ---
  try {
    const paymentResponse: any = await $fetch(
      "https://cpg.torobpay.com/api/online/payment/v1/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // توکن از مرحله ۱
        },
        body: torobBody,
      }
    );

    // بررسی پاسخ موفق
    if (paymentResponse.successful && paymentResponse.response.paymentPageUrl) {
      return {
        url: paymentResponse.response.paymentPageUrl,
        token: paymentResponse.response.paymentToken,
      };
    } else {
      throw new Error("خطا در پاسخ درگاه");
    }
  } catch (error: any) {
    console.error("Torob Payment Error:", error);
    throw createError({
      statusCode: 502,
      message: "خطا در ایجاد تراکنش ترب",
      data: error.data,
    });
  }
});
