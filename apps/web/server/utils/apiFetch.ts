import type { H3Event } from 'h3';

type ApiFetchOptions = Parameters<typeof $fetch>[1];

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'خطا در برقراری ارتباط با سرور نیمورا';
  }

  const candidate = error as {
    data?: { message?: string | string[] };
    statusMessage?: string;
    message?: string;
  };
  const message = candidate.data?.message ?? candidate.statusMessage ?? candidate.message;
  return Array.isArray(message) ? message.join('، ') : message || 'خطا در برقراری ارتباط با سرور نیمورا';
}

export async function apiFetch<T>(
  event: H3Event,
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, 'accesstoken');
  const headers = new Headers(options.headers as HeadersInit | undefined);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    return await $fetch<T>(path, {
      baseURL: config.apiBase,
      ...options,
      headers,
    });
  } catch (error: unknown) {
    const response = error && typeof error === 'object'
      ? (error as { response?: { status?: number }; statusCode?: number })
      : {};

    const statusCode = response.response?.status ?? response.statusCode ?? 502;
    if (statusCode === 401) {
      deleteCookie(event, 'accesstoken', { path: '/' });
    }

    throw createError({
      statusCode,
      statusMessage: getErrorMessage(error),
    });
  }
}
