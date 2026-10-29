export default defineNuxtRouteMiddleware((to) => {
  const { mode, check } = useShop3dAccess()
  const redirect = () =>
    navigateTo({ path: '/', query: { from: '3d', reason: 'unavailable' } }, { replace: true })

  // kill switch: روی سرور هم قطعی است و HTML ۳D اصلاً ساخته نمی‌شود
  if (mode === 'off') return redirect()

  if (import.meta.server) return
  if (useNuxtApp().isHydrating) return // صفحه بعد از mount خودش چک می‌کند
  if (!check(to.query)) return redirect()
})