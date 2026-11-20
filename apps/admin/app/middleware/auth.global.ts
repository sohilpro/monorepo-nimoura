import { UserRole } from "@nimoura/shared-types";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  const isAuthPage = to.path === "/auth" || to.path.startsWith("/auth/");

  // بازیابی پروفایل کاربر در صورت خالی بودن استیت
  if (!auth.value) {
    try {
      const userRes = await $fetch<any>("/api/auth/me").catch(() => null);
      const user = userRes?.data ?? userRes;
      if (user && user.id && user.role) {
        auth.value = user;
      } else {
        auth.value = null;
      }
    } catch {
      auth.value = null;
    }
  }

  // مدیریت صفحه ورود: اگر کاربر قبلاً با سطح دسترسی مجاز وارد شده باشد، هدایت به داشبورد
  if (isAuthPage) {
    if (
      auth.value &&
      (auth.value.role === UserRole.ADMIN || auth.value.role === UserRole.OWNER)
    ) {
      const rawRedirect = to.query.redirect;
      const target =
        typeof rawRedirect === "string" &&
        rawRedirect.startsWith("/") &&
        !rawRedirect.startsWith("//")
          ? rawRedirect
          : "/";
      return navigateTo(target);
    }
    return;
  }

  // اگر احراز هویت نشده باشد، هدایت به صفحه ورود با حفظ مسیر بازگشت
  if (!auth.value) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // جلوگیری قاطع از ورود کاربران عادی به پنل ادمین
  if (
    auth.value.role !== UserRole.ADMIN &&
    auth.value.role !== UserRole.OWNER
  ) {
    auth.value = null;
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    return navigateTo("/auth?error=forbidden");
  }

  // کنترل سطح دسترسی صفحات اختصاصی مالک (Owner-Only)
  const isOwnerOnlyPage =
    to.path === "/loyalty" || to.path.startsWith("/loyalty/");

  if (isOwnerOnlyPage && auth.value.role !== UserRole.OWNER) {
    return navigateTo("/?error=owner_required");
  }
});
