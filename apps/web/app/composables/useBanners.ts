import type { BannerItem } from "#shared/types/banners";

export function useBanners(
  positionKey: MaybeRefOrGetter<string>,
  options: { lazy?: boolean } = {},
) {
  const device = useBannerDevice();
  // استفاده از computed تا با تغییر ref/getter به‌روز شود
  const key = computed(() => toValue(positionKey));

  const started = ref(!options.lazy);

  const { data, status, execute } = useFetch<BannerItem[]>(
    () => `/api/banners/position/${encodeURIComponent(key.value || "unknown")}`,
    {
      key: `banners:${key.value}`,
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

  const banners = computed(() => data.value ?? []);

  // قبل از شروع درخواست یا در حین دریافت اولیه → اسکلتون
  const loading = computed(
    () =>
      !started.value || (status.value === "pending" && !banners.value.length),
  );

  return { banners, loading, start };
}
