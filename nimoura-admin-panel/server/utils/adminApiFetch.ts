// server/utils/adminApiFetch.ts
// نسخه ادمین apiFetch: توکن احراز هویت ادمین را از کوکی گرفته و به بک‌اند NestJS پاس می‌دهد.
// فرض بر این است که پروژه نیمورا از قبل یک سیستم لاگین ادمین/JWT دارد که توکن آن
// در کوکی httpOnly به نام "nimoura_admin_token" ذخیره می‌شود — نام کوکی را مطابق پروژه خودتان تغییر دهید.
import type { H3Event } from "h3";

export async function adminApiFetch<T>(
  event: H3Event,
  path: string,
  options: Parameters<typeof $fetch>[1] = {},
): Promise<T> {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "accesstoken");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "ورود ادمین الزامی است",
    });
  }

  try {
    return await $fetch<T>(path, {
      baseURL: config.apiBase,
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 502,
      statusMessage: error?.data?.message || "خطا در ارتباط با سرور مجله",
    });
  }
}
