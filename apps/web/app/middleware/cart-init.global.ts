export default defineNuxtRouteMiddleware(() => {
  const cart = useCartStore();
  (cart as any).initGuest();
});
