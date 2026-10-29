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
      auth.value = data.value?.data;
    }
  } catch (e) {
    if (import.meta.dev) {
      console.warn("Unexpected auth error:", e);
    }
    auth.value = null;
  }
});
