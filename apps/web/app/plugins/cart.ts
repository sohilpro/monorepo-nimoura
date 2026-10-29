// plugins/cart.ts
export default defineNuxtPlugin(async () => {
  const auth = useAuth();
  const cart = useCartStore();
  const { fetchUserCart } = useCartActions();

  if (auth.value) {
    // کاربر لاگینه: یک‌بار سبد واقعی از سرور میاد و در store می‌شینه
    await fetchUserCart();
  } else {
    // مهمونه: فقط guestId مقداردهی بشه، items خودش از localStorage reactive میاد
    cart.initGuest();
  }

  // اگه در طول همین session کاربر لاگین/لاگ‌اوت کرد، دوباره sync بشه
  watch(auth, async (newVal, oldVal) => {
    if (newVal && !oldVal) {
      // لاگین شد
      await fetchUserCart();
    } else if (!newVal && oldVal) {
      // لاگ‌اوت شد
      cart.clearCart();
      cart.initGuest();
    }
  });
});