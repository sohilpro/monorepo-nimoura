export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  // در صورتی که کاربر در استیت مقداردهی نشده باشد، از سرور استعلام می‌گیریم
  if (!auth.value) {
    try {
      const res: any = await $fetch('/api/auth/me').catch(() => null);
      const user = res?.data ?? res;
      if (user && user.id) {
        auth.value = user;
      } else {
        auth.value = null;
      }
    } catch {
      auth.value = null;
    }
  }

  // اگر احراز هویت نشده باشد، هدایت به صفحه ورود همراه با مسیر بازگشت
  if (!auth.value) {
    const isCartCheckout = to.path.startsWith('/cart');
    const redirectUrl = `/auth?redirect=${encodeURIComponent(to.fullPath)}${isCartCheckout ? '&sync_cart=true' : ''}`;
    return navigateTo(redirectUrl);
  }
});
