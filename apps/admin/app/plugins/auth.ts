// app/plugins/auth.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuth();

  // اگر قبلاً مقداردهی نشده، حتماً fetch کن
  if (!auth.value) {
    try {
      // استفاده از await برای اینکه حتما قبل از روت‌ها جواب بیاید
      const { data, error }: any = await useFetch("/api/auth/me");

      if (error.value) {
        auth.value = null;
      } else {
        auth.value = data.value?.data ?? data.value;
      }
    } catch {
      auth.value = null;
    }
  }
});