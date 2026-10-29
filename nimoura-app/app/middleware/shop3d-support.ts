export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  if (useNuxtApp().isHydrating) return // صفحه بعد از mount خودش چک می‌کند
  if (to.query.force3d === '1') return

  const s = evaluateSupport()
  if (!s.ok) {
    return navigateTo({ path: '/', query: { from: '3d', reason: s.reason } }, { replace: true })
  }
})