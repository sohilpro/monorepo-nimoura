export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuth();

  try {
    const { data, error }: any = await useFetch("/api/auth/me");

    if (error.value) {
      if (import.meta.dev) {
        console.warn("Auth error:", error.value);
      }
      auth.value = null;
    } else {
      const u = data.value?.data ?? data.value;
      if (u && u.id) {
        auth.value = u;
      } else {
        auth.value = null;
      }
    }
  } catch (e) {
    if (import.meta.dev) {
      console.warn("Unexpected auth error:", e);
    }
    auth.value = null;
  }
});
