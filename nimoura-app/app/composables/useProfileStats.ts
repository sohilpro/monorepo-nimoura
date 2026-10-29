// composables/useProfileStats.ts
interface ProfileStatsResponse {
  data: {
    stats: {
      ordersCount: number;
      addressesCount: number;
      wishlistCount: number;
    };
  };
}

export function useProfileStats() {
  const { data, pending, error, refresh } = useFetch<ProfileStatsResponse>(
    "/api/user/profile",
    { key: "user-profile" },
  );

  const stats = computed(() => [
    { value: data.value?.data.stats.ordersCount ?? 0, label: "سفارش" },
    { value: data.value?.data.stats.wishlistCount ?? 0, label: "علاقه‌مندی" },
    { value: data.value?.data.stats.addressesCount ?? 0, label: "آدرس" },
  ]);

  return { stats, pending, refresh };
}
