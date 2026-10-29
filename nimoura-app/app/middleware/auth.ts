export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  if (auth.value === null) {
    await nextTick();

    if (auth.value === null) {
      return;
    }
  }

  if (!auth.value && to.path === "/cart/checkout") {
    return navigateTo("/auth?redirect=/cart/checkout&sync_cart=true");
  }
});
