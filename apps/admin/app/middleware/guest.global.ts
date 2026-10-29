import { UserRole } from '@nimoura/shared-types';

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/auth" || to.path.startsWith("/auth/")) return;

  const auth = useAuth();

  if (!auth.value) {
    try {
      const user = await $fetch<any>("/api/auth/me").catch(() => null);
      if (user) {
        auth.value = user?.data ?? user;
      }
    } catch {
      // Ignore
    }
  }

  if (!auth.value) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  if (auth.value.role !== UserRole.ADMIN && auth.value.role !== UserRole.OWNER) {
    return navigateTo("/auth?error=unauthorized");
  }
});