/** هر بنر در هر بار بارگذاری صفحه فقط یک impression ثبت می‌کند */
const viewed = new Set<number>()

function send(url: string) {
  try {
    // sendBeacon با رفتن به صفحه‌ی بعد هم لغو نمی‌شود
    if (navigator.sendBeacon?.(url)) return
  } catch {}
  $fetch(url, { method: 'POST', keepalive: true }).catch(() => {})
}

export function useBannerTracker() {
  return {
    view(id: number) {
      if (import.meta.server || viewed.has(id)) return
      viewed.add(id)
      send(`/api/banners/${id}/view`)
    },
    click(id: number) {
      if (import.meta.server) return
      send(`/api/banners/${id}/click`)
    },
  }
}