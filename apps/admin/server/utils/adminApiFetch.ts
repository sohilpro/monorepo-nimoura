// server/utils/adminApiFetch.ts
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
    const statusCode = error?.response?.status || error?.statusCode || 502;
    const rawMessage =
      error?.data?.message ||
      error?.response?._data?.message ||
      error?.statusMessage ||
      error?.message ||
      "خطا در برقراری ارتباط با سرور نیمورا";
    const statusMessage =
      Array.isArray(rawMessage)
        ? rawMessage.join(" - ")
        : typeof rawMessage === "string"
        ? rawMessage
        : JSON.stringify(rawMessage);

    throw createError({
      statusCode,
      statusMessage,
      data: error?.data || error?.response?._data,
    });
  }
}
