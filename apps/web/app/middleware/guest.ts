export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  if (!auth.value) {
    return navigateTo("/auth");
  }
});
