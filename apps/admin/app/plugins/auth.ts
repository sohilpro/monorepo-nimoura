// app/plugins/auth.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuth();

  // اگر قبلاً مقداردهی نشده، حتماً fetch کن
  if (!auth.value) {
    try {
      const { data, error }: any = await useFetch("/api/auth/me");

      if (error.value) {
        auth.value = null;
      } else {
        const u = data.value?.data ?? data.value;
        if (u && u.id && u.role) {
          auth.value = u;
        } else {
          auth.value = null;
        }
      }
    } catch {
      auth.value = null;
    }
  }
});
