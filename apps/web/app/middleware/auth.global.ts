export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  const isProtectedPath =
    to.path.startsWith('/profile') ||
    to.path === '/cart/checkout' ||
    to.path === '/cart/payment';

  const isGuestOnlyPath =
    to.path === '/auth' ||
    to.path.startsWith('/auth/') ||
    to.path === '/register';

  if (!isProtectedPath && !isGuestOnlyPath) {
    return;
  }

  // استعلام وضعیت لاگین از سرور در صورت خالی بودن استیت
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

  // مسیرهای نیازمند لاگین کاربر
  if (isProtectedPath && !auth.value) {
    const isCartCheckout = to.path.startsWith('/cart');
    const redirectUrl = `/auth?redirect=${encodeURIComponent(to.fullPath)}${isCartCheckout ? '&sync_cart=true' : ''}`;
    return navigateTo(redirectUrl);
  }

  // مسیرهای ویژه کاربران مهمان (ورود و ثبت‌نام)
  if (isGuestOnlyPath && auth.value) {
    const rawRedirect = to.query.redirect;
    const target =
      typeof rawRedirect === 'string' &&
      rawRedirect.startsWith('/') &&
      !rawRedirect.startsWith('//')
        ? rawRedirect
        : '/profile';

    return navigateTo(target);
  }
});
