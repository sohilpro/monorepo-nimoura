// server/utils/apiFetch.ts
import type { H3Event } from "h3";

export async function apiFetch<T>(
  event: H3Event,
  path: string,
  options: Parameters<typeof $fetch>[1] = {},
): Promise<T> {
  const config = useRuntimeConfig(event);

  try {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBasePublic,
      ...options,
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
