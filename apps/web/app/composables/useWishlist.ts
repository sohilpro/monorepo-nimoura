export interface WishlistProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  priceDiscount: number;
  thumbnail: string;
}

export function useWishlist() {
  const toast = useAppToast();
  const auth = useAuth();

  const { data, pending, refresh } = useFetch<{
    data: { items: WishlistProduct[]; total: number };
  }>("/api/wishlist", {
    key: "wishlist",
    immediate: !!auth.value, // کاربر مهمون: اصلاً فچ نکن
  });

  const items = computed(() => data.value?.data.items ?? []);
  const total = computed(() => data.value?.data.total ?? 0);

  // Set برای چک سریع O(1) به‌جای .find/.some روی آرایه
  const wishlistIds = computed(() => new Set(items.value.map((i) => i.id)));

  function isInWishlist(productId: number): boolean {
    return wishlistIds.value.has(productId);
  }

  async function toggleWishlist(productId: number) {
    try {
      const res: any = await $fetch(`/api/wishlist/toggle/${productId}`, {
        method: "POST",
      });

      toast.success(res.data.message);
      await refresh(); // لیست و شمارش رو به‌روز کن

      return res.inWishlist as boolean;
    } catch (err: any) {
      toast.error(err?.data?.message || "خطا در بروزرسانی علاقه‌مندی‌ها");
      return null;
    }
  }

  async function removeFromWishlist(productId: number) {
    try {
      const res: any = await $fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });

      toast.info(res.data.message);
      await refresh();
    } catch (err: any) {
      toast.error(err?.data?.message || "خطا در حذف از علاقه‌مندی‌ها");
    }
  }

  return {
    items,
    total,
    pending,
    refresh,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
  };
}