import { v4 as uuidv4 } from "uuid";
// تغییر ۱: ایمپورت useLocalStorage
import { useLocalStorage, useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { useAuth } from "~/composables/useAuth";

export type CartVariant = { value: string; alt: string; id?: number };

export type CartItem = {
  productId: number;
  title: string;
  price: number;
  priceDiscount: number;
  quantity: number;
  thumbnail: string;
  slug: string;
  product?: any;
  variant?: CartVariant;
};

type NewCartItemInput = {
  productId: number;
  title: string;
  slug: string;
  price: number;
  priceDiscount?: number;
  thumbnail?: string;
  variant?: CartVariant;
};

function sameVariant(a?: CartVariant, b?: CartVariant) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function resolvePricing(item: any, isLoggedIn: boolean) {
  const price = isLoggedIn ? item.product?.price : item.price;
  const priceDiscount = isLoggedIn
    ? item.product?.priceDiscount
    : item.priceDiscount;
  const finalPrice = priceDiscount && priceDiscount > 0 ? priceDiscount : price;

  return { price, priceDiscount, finalPrice };
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    // تغییر ۲: وصل کردن مستقیم استیت به لوکال استوریج با VueUse
    items: useLocalStorage<CartItem[]>("nimoura_cart_items", []),
    guestId: null as string | null,
    shippingCost: null as number | null,
    promotion: null as number | null,
  }),

  getters: {
    totalPrice(state): number {
      const isLoggedIn = !!useAuth().value;
      return state.items.reduce(
        (sum, item) =>
          sum + resolvePricing(item, isLoggedIn).finalPrice * item.quantity,
        0,
      );
    },

    totalPriceFinal(): number {
      return this.totalPrice + (this.shippingCost ?? 0) - (this.promotion ?? 0);
    },

    totalCount: (state) => (state.items ?? []).length,

    totalDiscountAmount(state): number {
      const isLoggedIn = !!useAuth().value;
      return state.items.reduce((sum, item) => {
        const { price, priceDiscount } = resolvePricing(item, isLoggedIn);
        if (priceDiscount && priceDiscount > 0) {
          return sum + (price - priceDiscount) * item.quantity;
        }
        return sum;
      }, 0);
    },
  },

  actions: {
    initGuest() {
      const auth = useAuth();

      if (auth.value !== null) {
        this.guestId = null;
        return;
      }

      const guestIdStorage = useStorage<string | null>("guest_id", null);
      guestIdStorage.value ??= uuidv4();
      this.guestId = guestIdStorage.value;
    },

    // جدید: خوندن guestId مستقیم از storage، بدون توجه به وضعیت لاگین
    // برای مصرف در لحظه‌ی سینک بعد از لاگین که ممکنه this.guestId
    // (به‌خاطر initGuest یا رفرش صفحه) از دست رفته باشه
    getStoredGuestId(): string | null {
      const guestIdStorage = useStorage<string | null>("guest_id", null);
      return guestIdStorage.value;
    },

    clearGuestId() {
      const guestIdStorage = useStorage<string | null>("guest_id", null);
      guestIdStorage.value = null;
      this.guestId = null;
    },

    addItem(product: NewCartItemInput, quantity = 1) {
      const newItem: CartItem = {
        ...product,
        thumbnail: product.thumbnail ?? "",
        priceDiscount: product.priceDiscount ?? 0,
        quantity,
      };

      const existing = this.items.find(
        (i) =>
          i.productId === newItem.productId &&
          sameVariant(i.variant, newItem.variant),
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push(newItem);
        // useNuxtApp().$toast.success("کالا به سبد خرید شما افزوده شد!");
      }
    },

    removeItem(productId: number, variant?: CartVariant) {
      this.items = this.items.filter((i) => {
        if (i.productId !== productId) return true;
        return variant ? !sameVariant(i.variant, variant) : false;
      });
    },

    updateQuantity(productId: number, quantity: number, variant?: CartVariant) {
      const item = this.items.find(
        (i) =>
          i.productId === productId &&
          (variant ? sameVariant(i.variant, variant) : true),
      );
      if (item) item.quantity = quantity;
    },

    clearCart() {
      this.items = [];
    },

    replaceCart(newItems: CartItem[]) {
      this.items = [...newItems];
    },

    discountPercent(item: any): number {
      const isLoggedIn = !!useAuth().value;
      const { price, priceDiscount } = resolvePricing(item, isLoggedIn);

      if (!priceDiscount || priceDiscount <= 0 || !price || price <= 0)
        return 0;

      return Math.round(((price - priceDiscount) / price) * 100);
    },
  },
});
