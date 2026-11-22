import type { BannerItem } from "#shared/types/banners";
import { formatImageUrl } from "../utils/mediaUrl";

/** شکلی که بکند واقعاً برمیگرداند (پوشش ResponseInterceptor + فیلدهای entity) */
interface ApiBanner {
  id: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  /** برخی سرویسها تصویر را با نام image برمیگردانند */
  image?: string;
  mobileImageUrl?: string;
  link?: string;
  linkTarget?: '_self' | '_blank';
  target?: '_self' | '_blank';
  alt?: string;
  metadata?: { altText?: string } | null;
}

interface ApiBannerList {
  success?: boolean;
  data?: ApiBanner[] | ApiBannerList;
  items?: ApiBanner[] | ApiBannerList;
  /** شکلی که اندپوینت ادمین برمیگرداند (همان آرایه در سه کلید) */
  banners?: ApiBanner[] | ApiBannerList;
}

/** تبدیل پاسخ بکند به شکلی که کامپوننتهای بنر انتظار دارند */
function normalizeBanner(banner: ApiBanner): BannerItem | null {
  const image = formatImageUrl(
    banner.imageUrl || banner.image || banner.mobileImageUrl || '',
  );
  if (!image) return null; // بنر بدون تصویر نباید باعث درخواست اشتباه شود

  return {
    id: banner.id,
    title: banner.title || '',
    alt:
      banner.metadata?.altText ||
      banner.alt ||
      banner.title ||
      'بنر تبلیغاتی',
    image,
    mobileImage: banner.mobileImageUrl
      ? formatImageUrl(banner.mobileImageUrl)
      : undefined,
    link: banner.link || undefined,
    target:
      banner.linkTarget === '_blank' || banner.target === '_blank'
        ? '_blank'
        : '_self',
  };
}

/**
 * پاسخها میتواند هر یک از این شکلها باشد:
 *   Banner[]  |  { success, data: Banner[] }  |  { data: { items: [...] } }
 *   { data, items, banners, meta, ... }       (شکل اندپوینت ادمین)
 * بنابراین آرایه را با جستجوی محدود در کلیدهای شناختهشده پیدا میکنیم.
 */
function extractBannerArray(payload: unknown, depth = 0): ApiBanner[] {
  if (Array.isArray(payload)) return payload as ApiBanner[];
  if (!payload || typeof payload !== 'object' || depth > 3) return [];

  const obj = payload as ApiBannerList;
  const keys = ['data', 'items', 'banners'] as const;

  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as ApiBanner[];
  }
  for (const key of keys) {
    const nested = obj[key];
    if (nested && typeof nested === 'object') {
      const found = extractBannerArray(nested, depth + 1);
      if (found.length) return found;
    }
  }
  return [];
}

export function normalizeList(payload: unknown): BannerItem[] {
  return extractBannerArray(payload)
    .map(normalizeBanner)
    .filter((banner): banner is BannerItem => banner !== null);
}

export function useBanners(
  positionKey: MaybeRefOrGetter<string>,
  options: { lazy?: boolean } = {},
) {
  const device = useBannerDevice();
  const key = computed(() => toValue(positionKey));
  const started = ref(!options.lazy);

  const { data, status, execute } = useFetch<ApiBanner[] | ApiBannerList>(
    () => `/api/banners/position/${encodeURIComponent(key.value || "unknown")}`,
    {
      query: { device },
      default: () => [],
      dedupe: "defer",
      immediate: !options.lazy, // در حالت lazy: نه SSR، نه موقع mount
      watch: false,
    },
  );

  // تغییر device (بعد از mount) فقط وقتی درخواست بزند که قبلاً شروع شده باشد
  watch(device, () => {
    if (started.value) execute();
  });

  function start() {
    if (started.value) return;
    started.value = true;
    execute();
  }

  const banners = computed(() => normalizeList(data.value));

  // قبل از شروع درخواست یا در حین دریافت اولیه → اسکلتون
  const loading = computed(
    () =>
      !started.value || (status.value === "pending" && !banners.value.length),
  );

  return { banners, loading, start };
}
