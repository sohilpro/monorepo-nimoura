export default defineNuxtPlugin(async () => {
  const auth = useAuth();

  // پلاگینها نباید از useFetch استفاده کنند: هندلر SSR آن میتواند undefined
  // برگرداند (مثلاً وقتی بکند در دسترس نیست) و Nuxt هشدار E3006 میدهد و
  // درخواست را دوباره روی کلاینت تکرار میکند. $fetch مستقیم این مشکل را ندارد.
  try {
    const response: any = await $fetch("/api/auth/me");
    const u = response?.data ?? response;

    auth.value = u && u.id ? u : null;
  } catch (e) {
    if (import.meta.dev) {
      console.warn("Auth check failed:", e);
    }
    auth.value = null;
  }
});
