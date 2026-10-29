export function useCartSummary() {
  const store: any = useCartStore();
  const auth = useAuth();
  const cartActions = useCartActions();

  const isLoggedIn = computed(() => !!auth.value);
  const loading = ref(false);

  const items = computed(() => {
    return (store.items ?? []).map((item: any) => {
      const source = isLoggedIn.value ? item.product : item;
      const productId = isLoggedIn.value ? item.product?.id : item.productId;
      return {
        key: `${productId}-${item.variant?.id ?? item.variant?.value ?? 'no-variant'}`,
        productId,
        title: source?.title,
        slug: source?.slug,
        thumbnail: source?.thumbnail,
        price: source?.price ?? 0,
        priceDiscount: source?.priceDiscount ?? 0,
        quantity: item.quantity,
        variant: item.variant ?? undefined,
      };
    });
  });

  const totalCount = computed(() => store.totalCount ?? 0);
  const totalPrice = computed(() => store.totalPrice ?? 0);
  const totalDiscount = computed(() => store.totalDiscountAmount ?? 0);

  async function refresh() {
    if (!isLoggedIn.value) return;
    loading.value = true;
    await cartActions.fetchUserCart();
    loading.value = false;
  }

  return { isLoggedIn, loading, items, totalCount, totalPrice, totalDiscount, refresh };
}
