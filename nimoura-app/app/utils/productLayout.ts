// app/utils/productLayout.ts
import { ALL_SHELVES, FURNITURE, SHELF, tierSurfaces } from './storeLayout'
import type { ShelfConfig, ZoneId } from './storeLayout'
import type { Vec3 } from './storeDimensions'
import { zoneOf } from './shopCatalog'
import type { ShopProduct } from './shopCatalog'

/** ابعاد جعبه محصول (متر). نسبت 0.14:0.18 با سلول اطلس یکی است */
export const PRODUCT = { w: 0.14, h: 0.18, d: 0.05, gap: 0.05, frontInset: 0.05 } as const

export interface Placement {
  productId: number
  zone: ZoneId | 'island'
  /** شناسه قفسه یا 'island' */
  anchor: string
  /** مرکز جعبه در مختصات دنیا */
  pos: Vec3
  /** جهت روی جعبه: +Z محلی جعبه به سمت مشتری */
  rotY: number
}

export interface LayoutResult {
  placements: Placement[]
  dropped: ShopProduct[]
  unmappedCategories: string[]
  perZone: Record<string, number>
}

interface Unit { p: ShopProduct; n: number }

const EYE_FOCUS = 1.35 // ردیف‌های نزدیک این ارتفاع اولویت دارند

function facingsOf(p: ShopProduct) {
  if (!p.available) return 1
  return p.stock >= 20 ? 3 : p.stock >= 10 ? 2 : 1
}

const perRow = (s: ShelfConfig) =>
  Math.floor((s.width - 2 * SHELF.side + PRODUCT.gap) / (PRODUCT.w + PRODUCT.gap))

/** محلی قفسه → دنیا (چرخش حول Y مثل three) */
function toWorld(s: ShelfConfig, lx: number, ly: number, lz: number): Vec3 {
  const c = Math.cos(s.rotationY)
  const n = Math.sin(s.rotationY)
  return [s.position[0] + lx * c + lz * n, s.position[1] + ly, s.position[2] - lx * n + lz * c]
}

/** واحدها را بین قفسه‌های یک بخش تقسیم می‌کند (پیوسته، تا دسته‌ها کنار هم بمانند) */
function distribute(shelves: ShelfConfig[], units: Unit[]) {
  const caps = shelves.map((s) => s.tiers * perRow(s))
  const total = units.reduce((a, u) => a + u.n, 0)
  const target = Math.ceil(total / shelves.length)
  const loads = shelves.map(() => 0)
  const lists: Unit[][] = shelves.map(() => [])
  const leftovers: Unit[] = []

  let si = 0
  for (const u of units) {
    while (si < shelves.length - 1 && loads[si]! > 0 && loads[si]! + u.n > target) si++
    if (loads[si]! + u.n <= caps[si]!) {
      lists[si]!.push(u)
      loads[si]! += u.n
    } else leftovers.push(u)
  }

  const dropped: Unit[] = []
  for (const u of leftovers) {
    const k = loads.findIndex((l, i) => l + u.n <= caps[i]!)
    if (k >= 0) {
      lists[k]!.push(u)
      loads[k]! += u.n
    } else dropped.push(u)
  }
  return { lists, dropped }
}

function layoutShelf(s: ShelfConfig, units: Unit[], out: Placement[]): Unit[] {
  const slots = units.reduce((a, u) => a + u.n, 0)
  if (!slots) return []

  const row = perRow(s)
  const surfaces = tierSurfaces(s.height, s.tiers)
  const rowsCount = Math.min(s.tiers, slots)

  // نزدیک‌ترین طبقه‌ها به سطح چشم، از بالا به پایین مرتب
  const tierIdx = surfaces
    .map((y, i) => ({ i, d: Math.abs(y + PRODUCT.h / 2 - EYE_FOCUS) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, rowsCount)
    .map((r) => r.i)
    .sort((a, b) => b - a)

  const target = Math.ceil(slots / rowsCount)
  const rows: Unit[][] = tierIdx.map(() => [])
  const dropped: Unit[] = []
  let r = 0
  let used = 0
  for (const u of units) {
    if (used > 0 && (used + u.n > row || (r < rowsCount - 1 && used + u.n > target))) {
      if (r < rowsCount - 1) { r++; used = 0 }
    }
    if (used + u.n > row) { dropped.push(u); continue }
    rows[r]!.push(u)
    used += u.n
  }

  const z = s.depth / 2 - PRODUCT.frontInset - PRODUCT.d / 2
  rows.forEach((units2, k) => {
    const n = units2.reduce((a, u) => a + u.n, 0)
    if (!n) return
    const y = surfaces[tierIdx[k]!]! + PRODUCT.h / 2
    const width = n * PRODUCT.w + (n - 1) * PRODUCT.gap
    let x = -width / 2 + PRODUCT.w / 2
    for (const u of units2) {
      for (let f = 0; f < u.n; f++) {
        out.push({
          productId: u.p.id,
          zone: s.zone,
          anchor: s.id,
          pos: toWorld(s, x, y, z),
          rotY: s.rotationY,
        })
        x += PRODUCT.w + PRODUCT.gap
      }
    }
  })
  return dropped
}

/** پرتخفیف‌ترین‌های موجود برای جزیره */
export function pickFeatured(products: ShopProduct[], max = 11): ShopProduct[] {
  return products
    .filter((p) => p.available)
    .sort((a, b) => b.discountPercent - a.discountPercent || b.id - a.id)
    .slice(0, max)
}

function layoutIsland(featured: ShopProduct[], out: Placement[]) {
  const { position, topY, tier2Y } = FURNITURE.island
  const [ix, , iz] = position
  const top = featured.slice(0, 3)
  const ring = featured.slice(3, 11)

  const put = (p: ShopProduct, r: number, y: number, theta: number) =>
    out.push({
      productId: p.id,
      zone: 'island',
      anchor: 'island',
      pos: [ix + r * Math.sin(theta), y + PRODUCT.h / 2, iz + r * Math.cos(theta)],
      rotY: theta, // رو به بیرون
    })

  top.forEach((p, i) => put(p, 0.28, tier2Y, (i * Math.PI * 2) / top.length))
  ring.forEach((p, i) => put(p, 0.85, topY, ((i + 0.5) * Math.PI * 2) / ring.length))
}

export function layoutProducts(products: ShopProduct[]): LayoutResult {
  const placements: Placement[] = []
  const dropped: ShopProduct[] = []
  const unmapped = new Set<string>()
  const byZone = new Map<ZoneId, ShopProduct[]>()

  for (const p of products) {
    const { zone, matched } = zoneOf(p)
    if (!matched) unmapped.add(p.categoryName || `#${p.categoryId}`)
    byZone.set(zone, [...(byZone.get(zone) ?? []), p])
  }

  for (const [zone, list] of byZone) {
    const shelves = ALL_SHELVES.filter((s) => s.zone === zone)
    if (!shelves.length) { dropped.push(...list); continue }

    const units: Unit[] = [...list]
      .sort((a, b) => a.categoryId - b.categoryId || a.id - b.id)
      .map((p) => ({ p, n: facingsOf(p) }))

    const { lists, dropped: over } = distribute(shelves, units)
    dropped.push(...over.map((u) => u.p))
    shelves.forEach((s, i) => dropped.push(...layoutShelf(s, lists[i]!, placements).map((u) => u.p)))
  }

  layoutIsland(pickFeatured(products), placements)

  const perZone: Record<string, number> = {}
  for (const pl of placements) perZone[pl.zone] = (perZone[pl.zone] ?? 0) + 1

  return { placements, dropped, unmappedCategories: [...unmapped], perZone }
}