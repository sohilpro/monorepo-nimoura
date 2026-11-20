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

  // اگر کاربر لاگین است، نباید به صفحات ورود/ثبت‌نام مهمان دسترسی داشته باشد
  if (auth.value) {
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
