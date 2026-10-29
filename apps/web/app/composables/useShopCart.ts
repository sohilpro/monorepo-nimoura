// app/composables/useShopCart.ts
import { computed } from "vue";
import type { ShopProduct } from "~/utils/shopCatalog";

/** آدرس‌های سایت ۲بعدی. در صورت تفاوت اینجا عوض کنید */
export const SHOP_ROUTES = {
  product: (slug: string) => `/product/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
};

export interface ShopVariant {
  id: string | number;
  label: string;
  /** رنگ نمونه (hex)، اختیاری */
  color?: string;
  available: boolean;
  /** مقادیری که در CartVariant ذخیره می‌شوند؛ اگر نبود از label استفاده می‌شود */
  value?: string;
  alt?: string;
}

export interface CartLine {
  key: string;
  productId: number;
  variant?: { value: string; alt: string; id?: number };
  title: string;
  variantLabel?: string;
  image: string | null;
  unitPrice: number;
  qty: number;
}

/** همان منطق resolvePricing در cart store شما */
function unitPriceOf(item: any, loggedIn: boolean): number {
  const price = loggedIn ? item.product?.price : item.price;
  const disc = loggedIn ? item.product?.priceDiscount : item.priceDiscount;
  return Number(disc && disc > 0 ? disc : price) || 0;
}

export function useShopCart() {
  const store: any = useCartStore();
  const actions = useCartActions();
  const auth = useAuth();
  const catalog = useShopCatalog();

  const lines = computed<CartLine[]>(() => {
    const loggedIn = !!auth.value;
    return ((store.items ?? []) as any[]).map((i) => {
      const productId: number = i.productId ?? i.product?.id;
      const variant = i.variant ?? undefined;
      return {
        key: `${productId}:${JSON.stringify(variant ?? null)}`,
        productId,
        variant,
        title: i.title ?? i.product?.title ?? "",
        variantLabel: variant?.alt || variant?.value || undefined,
        image: i.thumbnail ?? i.product?.thumbnail ?? null,
        unitPrice: unitPriceOf(i, loggedIn),
        qty: Number(i.quantity) || 0,
      };
    });
  });

  const count = computed(() => lines.value.reduce((a, l) => a + l.qty, 0));
  const total = computed(() =>
    lines.value.reduce((a, l) => a + l.unitPrice * l.qty, 0),
  );

  const qtyOfProduct = (id: number) =>
    lines.value
      .filter((l) => l.productId === id)
      .reduce((a, l) => a + l.qty, 0);

  /** برای کاربر لاگین‌شده سبد را از سرور می‌گیرد (برای مهمان کاری نمی‌کند) */
  async function refresh() {
    if (auth.value) await actions.fetchUserCart();
  }

  /** لیست واریانت‌ها. null یعنی «نمی‌دانم» و کاربر به صفحه محصول می‌رود */
  async function loadVariants(_p: ShopProduct): Promise<ShopVariant[] | null> {
    // endpoint واریانت را که فرستادید اینجا وصل می‌کنیم
    return null;
  }

  async function add(p: ShopProduct, variant?: ShopVariant): Promise<void> {
    const before = qtyOfProduct(p.id);
    if (before + 1 > p.stock) throw new Error("موجودی کافی نیست");

    await actions.addItem(
      {
        productId: p.id,
        title: p.title,
        slug: p.slug, // برای مهمان در store ذخیره می‌شود
        price: p.price,
        priceDiscount: p.finalPrice < p.price ? p.finalPrice : 0,
        thumbnail: p.image ?? undefined,
        variant: variant
          ? {
              value: variant.value ?? variant.label,
              alt: variant.alt ?? variant.label,
              ...(typeof variant.id === "number" ? { id: variant.id } : {}),
            }
          : null,
      } as any,
      1,
    );

    // addItem خطا را فقط toast می‌کند و throw نمی‌کند؛ پس نتیجه را خودمان می‌سنجیم
    if (qtyOfProduct(p.id) <= before)
      throw new Error("افزودن به سبد انجام نشد");
    shopMarkAdded(p.id);
    shopTrackAddToCart(p, 1, variant?.label);
  }

  const find = (key: string) => lines.value.find((l) => l.key === key);

  async function setQty(key: string, qty: number): Promise<void> {
    const line = find(key);
    if (!line) return;
    if (qty <= 0) return remove(key);
    if (qty > line.qty) {
      const prod = catalog.products.value.find((x) => x.id === line.productId);
      if (prod && qty > prod.stock) throw new Error("موجودی کافی نیست");
    }
    await actions.updateQuantity(line.productId, qty, line.variant);
  }

  async function remove(key: string): Promise<void> {
    const line = find(key);
    if (line) await actions.removeItem(line.productId, line.variant);
  }

  return {
    lines,
    count,
    total,
    connected: true,
    refresh,
    loadVariants,
    add,
    setQty,
    remove,
  };
}
