// server/utils/apiFetch.ts
// یک fetch wrapper برای صدا زدن بک‌اند NestJS از سمت سرور Nuxt (Nitro).
// آدرس واقعی API هرگز به کلاینت لو نمی‌رود چون فقط در سمت سرور استفاده می‌شود.
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
    throw createError({
      statusCode: error?.response?.status || 502,
      statusMessage: error?.data?.message || "خطا در ارتباط با سرور مجله",
    });
  }
}
