export interface ProductVariantOption {
  id: number;
  value: string;
  alt: string;
  stock: number;
  price?: number;
  priceDiscount?: number;
  discountPercent?: number;
  colorHex?: string | null;
  isAvailable?: boolean;
}

export function useProductPurchase(
  product: MaybeRefOrGetter<any>,
  selectedVariant: MaybeRefOrGetter<ProductVariantOption | null | undefined>,
) {
  const cart = useCartStore();
  const auth = useAuth();
  const { addItem, updateQuantity, removeItem } = useCartActions();
  const toast = useAppToast();

  const busy = ref(false);

  const prod = computed(() => toValue(product));
  const variant = computed(() => toValue(selectedVariant) ?? null);

  const isVariantProduct = computed(() => prod.value?.type === "variant");

  const needsVariantSelection = computed(
    () => isVariantProduct.value && !variant.value,
  );

  const availableStock = computed(() => {
    if (isVariantProduct.value) {
      return variant.value ? Number(variant.value.stock ?? 0) : 0;
    }
    return Number(prod.value?.stock ?? 0);
  });

  const isOutOfStock = computed(() => {
    if (prod.value?.isAvailable === false) return true;
    if (isVariantProduct.value) {
      if (!variant.value) return false;
      return (
        variant.value.isAvailable === false ||
        Number(variant.value.stock ?? 0) <= 0
      );
    }
    return Number(prod.value?.stock ?? 0) <= 0;
  });

  const basePrice = computed(() => {
    if (isVariantProduct.value && variant.value?.price) {
      return Number(variant.value.price) || 0;
    }
    return Number(prod.value?.price) || 0;
  });

  const discountedPrice = computed(() => {
    if (isVariantProduct.value && variant.value) {
      return Number(variant.value.priceDiscount) || 0;
    }
    return Number(prod.value?.priceDiscount) || 0;
  });

  const hasDiscount = computed(
    () =>
      basePrice.value > 0 &&
      discountedPrice.value > 0 &&
      discountedPrice.value < basePrice.value,
  );

  const finalPrice = computed(() =>
    hasDiscount.value ? discountedPrice.value : basePrice.value,
  );

  const discountPercent = computed(() => {
    if (!hasDiscount.value) return 0;
    const fromSource = isVariantProduct.value
      ? Number(variant.value?.discountPercent)
      : Number(prod.value?.discountPercent);
    if (Number.isFinite(fromSource) && fromSource > 0) {
      return Math.round(fromSource);
    }
    return calculateDiscountPercentage(basePrice.value, discountedPrice.value);
  });

  const installmentPrice = computed(() => Math.ceil(finalPrice.value / 4));

  const stockBadge = computed(() => {
    if (isOutOfStock.value) {
      return {
        label: "ناموجود",
        textClass: "text-rose-600",
        dotClass: "bg-rose-500",
      };
    }
    if (needsVariantSelection.value) {
      return {
        label: "انتخاب تنوع",
        textClass: "text-amber-600",
        dotClass: "bg-amber-500",
      };
    }
    const threshold = Number(prod.value?.lowStockThreshold ?? 5);
    if (threshold > 0 && availableStock.value <= threshold) {
      return {
        label: `تنها ${numberFormat(availableStock.value)} عدد باقی مانده`,
        textClass: "text-amber-700",
        dotClass: "bg-amber-500",
      };
    }
    return {
      label: "موجود در انبار",
      textClass: "text-nimoura-success",
      dotClass: "bg-nimoura-success",
    };
  });

  const ctaLabel = computed(() => {
    if (isOutOfStock.value) return "ناموجود";
    if (needsVariantSelection.value) return "انتخاب گزینه";
    return "افزودن به سبد خرید";
  });

  const variantPayload = computed(() =>
    variant.value
      ? {
          id: variant.value.id,
          value: variant.value.value,
          alt: variant.value.alt,
        }
      : null,
  );

  const cartItem = computed(() => {
    const pid = Number(prod.value?.id);
    const selectedId = variant.value?.id;

    return (cart.items ?? []).find((item: any) => {
      const itemPid = auth.value
        ? Number(item.product?.id)
        : Number(item.productId);
      if (itemPid !== pid) return false;
      if (!isVariantProduct.value) return true;
      if (!selectedId) return false;
      if (item.variant?.id !== undefined) {
        return Number(item.variant.id) === selectedId;
      }
      return (
        item.variant?.value === variant.value?.value &&
        item.variant?.alt === variant.value?.alt
      );
    });
  });

  const cartQuantity = computed(() => Number(cartItem.value?.quantity ?? 0));

  function scrollToVariantPicker() {
    if (!import.meta.client) return;
    const el = document.getElementById("variant-picker");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function handleAddToCart() {
    if (isOutOfStock.value || !prod.value) return;

    if (needsVariantSelection.value) {
      scrollToVariantPicker();
      toast.warn("لطفاً ابتدا رنگ یا گزینه مورد نظر را انتخاب کنید");
      return;
    }

    busy.value = true;
    try {
      await addItem(
        {
          productId: prod.value.id,
          title: prod.value.title,
          slug: prod.value.slug || createSlug(prod.value.title),
          price: basePrice.value,
          priceDiscount: hasDiscount.value ? discountedPrice.value : 0,
          thumbnail: prod.value.thumbnail,
          variant: variantPayload.value,
        },
        1,
      );
    } finally {
      busy.value = false;
    }
  }

  async function handleIncrease() {
    if (busy.value || !prod.value || cartQuantity.value >= availableStock.value) {
      return;
    }
    busy.value = true;
    try {
      await updateQuantity(
        prod.value.id,
        cartQuantity.value + 1,
        variantPayload.value ?? undefined,
      );
    } finally {
      busy.value = false;
    }
  }

  async function handleDecrease() {
    if (busy.value || !prod.value) return;
    busy.value = true;
    try {
      if (cartQuantity.value <= 1) {
        await removeItem(prod.value.id, variantPayload.value ?? undefined);
      } else {
        await updateQuantity(
          prod.value.id,
          cartQuantity.value - 1,
          variantPayload.value ?? undefined,
        );
      }
    } finally {
      busy.value = false;
    }
  }

  return {
    busy,
    isVariantProduct,
    needsVariantSelection,
    availableStock,
    isOutOfStock,
    basePrice,
    hasDiscount,
    finalPrice,
    discountPercent,
    installmentPrice,
    stockBadge,
    ctaLabel,
    cartQuantity,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
  };
}
