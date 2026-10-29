// app/composables/useShop3dAccess.ts
export type Shop3dMode = 'off' | 'admin' | 'percent' | 'all'

const MODES: Shop3dMode[] = ['off', 'admin', 'percent', 'all']
const OVERRIDE_KEY = 'shop3d:override'
const VID_KEY = 'shop3d:vid'

/* =====================  ADAPTER: تشخیص ادمین  =====================
 * خروجی useAuth() را با ساختار واقعی کاربر خودتان تطبیق دهید */
function isAdminUser(user: any): boolean {
  if (!user) return false
  const role = String(user.role ?? '').toLowerCase()
  return (
    role === 'admin' ||
    user.isAdmin === true ||
    (Array.isArray(user.roles) && user.roles.some((r: any) => String(r).toLowerCase() === 'admin'))
  )
}
/* ================================================================ */

/** هش FNV-1a → عدد ۰ تا ۹۹ (پایدار برای یک شناسه) */
function bucketOf(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) % 100
}

function visitorId(): string | null {
  try {
    let id = localStorage.getItem(VID_KEY)
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      localStorage.setItem(VID_KEY, id)
    }
    return id
  } catch {
    return null // حالت خصوصی مرورگر
  }
}

export function useShop3dAccess() {
  const cfg = useRuntimeConfig().public as Record<string, unknown>
  const auth = useAuth()

  const raw = String(cfg.shop3dMode ?? 'off')
  const mode: Shop3dMode = MODES.includes(raw as Shop3dMode) ? (raw as Shop3dMode) : 'off'
  const percent = Math.min(100, Math.max(0, Number(cfg.shop3dPercent) || 0))

  /**
   * آیا این کاربر مغازه ۳بعدی را ببیند؟ فقط سمت کلاینت معنی دارد.
   * پارامترهای تست روی هر صفحه‌ای کار می‌کنند:
   *   ?shop3d=1      فعال‌سازی برای همین مرورگر (تستر)
   *   ?shop3d=0      غیرفعال‌سازی برای همین مرورگر (انصراف کاربر)
   *   ?shop3d=reset  پاک‌کردن انتخاب
   * حالت off یک kill switch مطلق است و هیچ‌چیز آن را دور نمی‌زند.
   */
  function check(query?: Record<string, unknown>): boolean {
    if (!import.meta.client) return false
    if (mode === 'off') return false

    try {
      const q = query?.shop3d
      if (q === '1') localStorage.setItem(OVERRIDE_KEY, 'on')
      else if (q === '0') localStorage.setItem(OVERRIDE_KEY, 'off')
      else if (q === 'reset') localStorage.removeItem(OVERRIDE_KEY)
    } catch { /* ignore */ }

    let override: string | null = null
    try { override = localStorage.getItem(OVERRIDE_KEY) } catch { /* ignore */ }
    if (override === 'off') return false
    if (override === 'on') return true

    if (mode === 'all') return true
    if (isAdminUser(auth.value)) return true // ادمین در admin و percent همیشه داخل است
    if (mode === 'percent') {
      const id = visitorId()
      return id ? bucketOf(id) < percent : false
    }
    return false
  }

  return { mode, percent, check }
}