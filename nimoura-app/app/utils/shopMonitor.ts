// app/utils/shopMonitor.ts
import type { ShopProduct } from './shopCatalog'

/* ===================== ADAPTER =====================
 * ابزار آنالیتیکس خودکار تشخیص داده می‌شود. فقط در صورت نیاز این‌ها را عوض کنید. */
export const SHOP_ANALYTICS = {
  /** شناسه شمارنده Yandex Metrika (اختیاری) */
  metrikaId: 0,
  /** رویداد استاندارد add_to_cart در GA4 هم ارسال شود؟ فقط اگر سایت ۲بعدی هم می‌فرستد */
  ga4Ecommerce: false,
  currency: 'IRR',
  /** قیمت‌های API تومان است؟ برای GA4 ×۱۰ می‌شود (ریال) */
  priceMultiplier: 10,
}

type Primitive = string | number | boolean | null | undefined
type Params = Record<string, Primitive>

function compact(p: Params = {}) {
  const o: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== null) o[k] = v
  return o
}

function common() {
  const q = useShopQuality()
  const s = evaluateSupport()
  return { ui: '3d', tier: q.tier, device: s.ok && s.profile.mobile ? 'mobile' : 'desktop' }
}

function send(name: string, data: Record<string, any>) {
  const w = window as any
  try {
    if (typeof w.gtag === 'function') w.gtag('event', name, data)
    else if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: name, ...data }) // GTM
    if (Array.isArray(w._paq)) {
      const row: any[] = ['trackEvent', 'shop3d', name, String(data.product_slug ?? data.zone ?? '')]
      if (Number.isFinite(Number(data.value)) && data.value !== undefined) row.push(Number(data.value))
      w._paq.push(row) // Matomo
    }
    if (typeof w.plausible === 'function') w.plausible(name, { props: data })
    if (w.umami?.track) w.umami.track(name, data)
    if (SHOP_ANALYTICS.metrikaId && typeof w.ym === 'function') {
      w.ym(SHOP_ANALYTICS.metrikaId, 'reachGoal', name, data)
    }
  } catch {
    /* آنالیتیکس هرگز نباید UI را خراب کند */
  }
}

export function shopTrack(name: string, params?: Params) {
  if (!import.meta.client) return
  const data = { ...common(), ...compact(params) }
  if (import.meta.dev) console.debug('[shop3d:track]', name, data)
  send(name, data)
}

export function shopTrackAddToCart(p: ShopProduct, qty = 1, variant?: string) {
  shopTrack('shop3d_add_to_cart', {
    product_id: p.id, product_slug: p.slug, value: p.finalPrice * qty, variant,
  })
  if (SHOP_ANALYTICS.ga4Ecommerce && import.meta.client) {
    const unit = p.finalPrice * SHOP_ANALYTICS.priceMultiplier
    send('add_to_cart', {
      ...common(),
      currency: SHOP_ANALYTICS.currency,
      value: unit * qty,
      items: [{
        item_id: String(p.id), item_name: p.title, item_brand: p.brandName,
        item_category: p.categoryName, item_variant: variant, price: unit, quantity: qty,
      }],
    })
  }
}

/* ===================== Sentry (اختیاری) ===================== */
const seen = new Set<string>()
const sentry = () => (import.meta.client ? (window as any).Sentry : undefined)

/** خطا را یک‌بار در هر نشست گزارش می‌کند (جلوگیری از سیل خطای تکراری در حلقه رندر) */
export function shopReportError(err: unknown, extra?: Record<string, unknown>) {
  if (!import.meta.client) return
  const e = err instanceof Error ? err : new Error(String(err))
  const key = `${e.name}:${e.message}`.slice(0, 200)
  if (seen.has(key)) return
  seen.add(key)

  const S = sentry()
  if (S?.captureException) S.captureException(e, { tags: { area: 'shop3d' }, extra })
  else console.error('[shop3d]', e, extra)
  shopTrack('shop3d_error', { kind: e.name, message: e.message.slice(0, 100) })
}

export function shopReportMessage(
  msg: string,
  level: 'info' | 'warning' | 'error' = 'warning',
  extra?: Record<string, unknown>,
) {
  if (!import.meta.client || seen.has(msg)) return
  seen.add(msg)
  const S = sentry()
  if (S?.captureMessage) S.captureMessage(msg, { level, tags: { area: 'shop3d' }, extra })
  else console.warn('[shop3d]', msg, extra)
}

/** زمینه‌ای که همه خطاهای Sentry همین صفحه می‌گیرند؛ با null پاک می‌شود */
export function shopSetContext(ctx: Record<string, string | number | boolean> | null) {
  const S = sentry()
  if (!S) return
  try {
    S.setContext?.('shop3d', ctx)
    S.setTag?.('ui', ctx ? '3d' : undefined)
  } catch { /* ignore */ }
}

/* ===================== «خرید با کمک ۳D» ===================== */
const ATTR_KEY = 'shop3d:attr'
const ATTR_TTL = 3 * 24 * 3600 * 1000

interface Attr { t: number; ids: number[] }

function readAttr(): Attr | null {
  try {
    const a = JSON.parse(localStorage.getItem(ATTR_KEY) ?? 'null') as Attr | null
    return a && Date.now() - a.t < ATTR_TTL && Array.isArray(a.ids) ? a : null
  } catch {
    return null
  }
}

/** هر بار محصولی از ۳D به سبد رفت صدا زده می‌شود */
export function shopMarkAdded(productId: number) {
  if (!import.meta.client) return
  try {
    const ids = new Set(readAttr()?.ids ?? [])
    ids.add(productId)
    localStorage.setItem(ATTR_KEY, JSON.stringify({ t: Date.now(), ids: [...ids] }))
  } catch { /* حالت خصوصی مرورگر */ }
}

/**
 * در صفحه «سفارش موفق» (۲بعدی) صدا بزنید. اگر سفارش شامل محصولی باشد که
 * در ۳ روز اخیر از ۳D به سبد رفته، رویداد shop3d_purchase ثبت می‌شود.
 * با refresh صفحه دوباره ثبت نمی‌شود.
 */
export function shopTrackPurchase(order: { id: string | number; total?: number; productIds?: number[] }): boolean {
  if (!import.meta.client) return false
  const a = readAttr()
  if (!a) return false
  const key = `shop3d:purchased:${order.id}`
  try { if (localStorage.getItem(key)) return false } catch { /* ignore */ }

  const overlap = order.productIds ? order.productIds.filter((id) => a.ids.includes(id)) : a.ids
  if (!overlap.length) return false

  shopTrack('shop3d_purchase', {
    order_id: String(order.id), value: order.total, items_from_3d: overlap.length,
  })
  try {
    localStorage.setItem(key, '1')
    localStorage.removeItem(ATTR_KEY)
  } catch { /* ignore */ }
  return true
}