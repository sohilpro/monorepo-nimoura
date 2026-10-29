export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/auth" || to.path.startsWith("/auth/")) return;

  const auth = useAuth();

  // اگر احراز هویت در حالتی است که هنوز مقدار ندارد، یکبار دیگر در صورت نیاز چک کنید
  // یا اگر کوکی/توکنی در مرورگر هست اما state هنوز پر نشده:
  if (!auth.value) {
    // برای اطمینان هنگام رفرش، یکبار دیگر سرور را چک میکنیم تا فالس‌پازitive ندهد
    try {
      const user = await $fetch("/api/auth/me").catch(() => null);
      console.log(user);
      
      if (user) {
        auth.value = (user as any)?.data ?? user;
        return; // کاربر لاگین است، اجازه عبور بده
      }
    } catch {}

    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});