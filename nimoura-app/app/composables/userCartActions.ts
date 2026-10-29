export const useCartActions = () => {
  const cart: any = useCartStore();
  const auth = useAuth();
  const { withLoading } = useLoading();
  const toast = useAppToast();

  // واکشی سبد خرید کاربر
  const fetchUserCart = async () => {
    if (!auth.value) return;

    try {
      return await withLoading(async () => {
        const userCart: any = await $fetch("/api/cart/getCart");
        cart.replaceCart(userCart.data.items);
        return userCart;
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "خطا در دریافت سبد خرید");
    }
  };

  // افزودن به سبد خرید
  const addItem = async (
    product: {
      productId: number;
      title: string;
      price: number;
      priceDiscount: number; // همیشه priceDiscount باشد
      thumbnail?: string;
      variant?: { value: string; alt: string } | null;
    },
    quantity = 1,
  ) => {
    if (auth.value) {
      try {
        await withLoading(
          async () =>
            await $fetch("/api/cart/add", {
              method: "POST",
              body: {
                productId: product.productId,
                quantity,
                variant: product.variant ?? null,
              },
            }),
        );

        toast.success("کالا به سبد خرید شما افزوده شد!");
        await fetchUserCart();
      } catch (err: any) {
        toast.error(err?.data?.message || "افزودن کالا با خطا مواجه شد");
      }
    } else {
      cart.addItem(product, quantity);
      toast.success("کالا به سبد خرید شما افزوده شد!");
    }
  };

  // حذف آیتم از سبد
  const removeItem = async (
    productId: number,
    variant?: { value: string; alt: string },
  ) => {
    if (auth.value) {
      try {
        await withLoading(
          async () =>
            await $fetch("/api/cart/remove", {
              method: "DELETE",
              query: { id: productId },
              body: { variant },
            }),
        );
        toast.info("کالا از سبد خرید حذف شد");
        await fetchUserCart();
      } catch (err: any) {
        toast.error(err?.data?.message || "حذف کالا با خطا مواجه شد");
      }
    } else {
      cart.removeItem(productId, variant);
      toast.info("کالا از سبد خرید حذف شد");
    }
  };

  // تغییر تعداد آیتم
  const updateQuantity = async (
    productId: number,
    quantity: number,
    variant?: { value: string; alt: string },
  ) => {
    if (auth.value) {
      try {
        await withLoading(
          async () =>
            await $fetch("/api/cart/update", {
              method: "PATCH",
              body: { productId, quantity, variant },
            }),
        );
        await fetchUserCart();
      } catch (err: any) {
        toast.error(err?.data?.message || "بروزرسانی تعداد با خطا مواجه شد");
      }
    } else {
      cart.updateQuantity(productId, quantity, variant);
    }
  };

  // همگام‌سازی سبد مهمان با کاربر
  const syncCart = async () => {
    const guestId = cart.guestId || cart.getStoredGuestId();
    if (!guestId || cart.items.length === 0) return false;

    try {
      await withLoading(async () => {
        await $fetch("/api/cart/sync", {
          method: "POST",
          body: {
            guestId,
            items: cart.items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              clientPrice: i.price,
              variant: i.variant ?? null,
            })),
          },
        });
      });

      cart.clearCart(); // items لوکال‌استوریج پاک می‌شه (چون خودِ state روی useLocalStorage نشسته)
      cart.clearGuestId(); // guest_id هم دیگه لازم نیست، پاکش می‌کنیم
      await fetchUserCart();
      return true;
    } catch (err: any) {
      // سایلنت: سینک پس‌زمینه‌ست، اما false برمی‌گردونیم تا صفحه بتونه تصمیم بگیره
      return false;
    }
  };

  // اعتبارسنجی قیمت‌ها
  const validatePrices = async () => {
    try {
      return await withLoading(async () => {
        const items = cart.items.map((item: any) => {
          const isLoggedIn = auth.value;

          const productId = isLoggedIn ? item.product.id : item.productId;
          const quantity = item.quantity;

          const clientPrice = isLoggedIn
            ? item.product.priceDiscount > 0
              ? item.product.priceDiscount
              : item.product.price
            : item.priceDiscount > 0
              ? item.priceDiscount
              : item.price;

          return {
            productId,
            quantity,
            clientPrice,
            variant: item.variant ?? null,
          };
        });

        const res: any = await $fetch("/api/cart/validate", {
          method: "POST",
          body: { items },
        });

        if (res.data.pricesChanged) {
          res.data.details.forEach((changed: any) => {
            const item = cart.items.find(
              (i: any) =>
                i.productId === changed.productId &&
                JSON.stringify(i.variant) === JSON.stringify(changed.variant),
            );
            if (item) item.price = changed.currentPrice;
          });

          toast.warn("قیمت برخی از کالاهای سبد شما بروزرسانی شد");
          return { changed: true, details: res.data.details };
        }

        return { changed: false, details: [] };
      });
    } catch (err: any) {
      return { changed: false, details: [] };
    }
  };

  const clearCart = async () => {
    if (auth.value) {
      try {
        await withLoading(
          async () => await $fetch("/api/cart/clear", { method: "DELETE" }),
        );
        toast.info("سبد خرید خالی شد");
        await fetchUserCart();
      } catch (err: any) {
        toast.error(err?.data?.message || "خالی‌کردن سبد با خطا مواجه شد");
      }
    } else {
      cart.clearCart();
      toast.info("سبد خرید خالی شد");
    }
  };

  return {
    fetchUserCart,
    addItem,
    syncCart,
    validatePrices,
    removeItem,
    updateQuantity,
    clearCart,
  };
};
