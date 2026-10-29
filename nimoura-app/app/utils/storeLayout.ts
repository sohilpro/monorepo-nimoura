// app/utils/storeLayout.ts
import { STORE } from './storeDimensions'
import type { Vec3 } from './storeDimensions'

export type ZoneId = 'skincare' | 'makeup' | 'fragrance' | 'body' | 'checkout'

export interface ShelfConfig {
  id: string
  zone: ZoneId
  variant: 'wall' | 'alcove'
  /** مرکز کف قفسه؛ جلوی قفسه روی محور +Z محلی است */
  position: Vec3
  rotationY: number
  width: number
  height: number
  depth: number
  tiers: number
}

/** ضخامت اجزای قفسه (متر) */
export const SHELF = { board: 0.03, side: 0.03, kick: 0.1, back: 0.02 } as const

/**
 * ارتفاع سطح بالایی هر طبقه از کف قفسه (محلی).
 * روز ۵ محصولات را دقیقاً روی همین ارتفاع‌ها می‌گذارد.
 */
export function tierSurfaces(height: number, tiers: number): number[] {
  const step = (height - SHELF.kick - SHELF.board) / tiers
  return Array.from({ length: tiers }, (_, i) => SHELF.kick + i * step + SHELF.board)
}

const { width: W, depth: D } = STORE
const HALF_PI = Math.PI / 2

const SHELF_DEPTH = 0.45
const SHELF_HEIGHT = 2.3
const WALL_GAP = 0.06 // فاصله از دیوار (پنل پایین دیوار جا بگیرد)
const SIDE_X = W / 2 - SHELF_DEPTH / 2 - WALL_GAP // ≈ 5.715

function wallRow(o: {
  prefix: string
  zone: ZoneId
  x: number
  rotationY: number
  count: number
  startZ: number
  width?: number
}): ShelfConfig[] {
  const width = o.width ?? 1.9
  const gap = 0.15
  return Array.from({ length: o.count }, (_, i) => ({
    id: `${o.prefix}-${i + 1}`,
    zone: o.zone,
    variant: 'wall' as const,
    position: [o.x, 0, o.startZ + i * (width + gap) + width / 2] as Vec3,
    rotationY: o.rotationY,
    width,
    height: SHELF_HEIGHT,
    depth: SHELF_DEPTH,
    tiers: 5,
  }))
}

/* ---------- قفسه‌های دیوار چپ: مراقبت پوست (۴ تا) ---------- */
const left = wallRow({
  prefix: 'skincare', zone: 'skincare',
  x: -SIDE_X, rotationY: HALF_PI, count: 4, startZ: -4.4,
})

/* ---------- دیوار راست: عطر (۲ تا) و بدن/مو (۱ تا) ---------- */
const right = wallRow({
  prefix: 'right', zone: 'fragrance',
  x: SIDE_X, rotationY: -HALF_PI, count: 3, startZ: -4.4,
}).map((s, i) => ({ ...s, zone: (i < 2 ? 'fragrance' : 'body') as ZoneId }))

/* ---------- قفسه پشت پیشخوان (محصولات کوچک کنار صندوق) ---------- */
const counterBack: ShelfConfig = {
  id: 'checkout-1', zone: 'checkout', variant: 'wall',
  position: [SIDE_X, 0, 3.675], rotationY: -HALF_PI,
  width: 1.55, height: SHELF_HEIGHT, depth: SHELF_DEPTH, tiers: 5,
}

export const WALL_SHELVES: ShelfConfig[] = [...left, ...right, counterBack]

/* ---------- طاق‌نماهای دیوار پشتی: آرایش ---------- */
export const ALCOVE = {
  xs: [-3.4, 0, 3.4],
  innerWidth: 2.0,
  frame: 0.1,
  rectHeight: 2.0, // ارتفاع بخش مستطیلی؛ بالای آن نیم‌دایره است
  backingDepth: 0.04,
  frameDepth: 0.1,
  shelfDepth: 0.38,
  tiers: 4,
} as const

/** گروه طاق‌نما کمی جلوتر از دیوار پشتی قرار می‌گیرد */
export const ALCOVE_Z = -D / 2 + 0.04

export const ALCOVE_SHELVES: ShelfConfig[] = ALCOVE.xs.map((x, i) => ({
  id: `makeup-${i + 1}`,
  zone: 'makeup' as const,
  variant: 'alcove' as const,
  position: [x, 0, -D / 2 + 0.04 + ALCOVE.backingDepth + ALCOVE.shelfDepth / 2] as Vec3,
  rotationY: 0,
  width: ALCOVE.innerWidth,
  height: ALCOVE.rectHeight,
  depth: ALCOVE.shelfDepth,
  tiers: ALCOVE.tiers,
}))

/** همه قفسه‌هایی که محصول می‌گیرند (برای روز ۵) */
export const ALL_SHELVES: ShelfConfig[] = [...WALL_SHELVES, ...ALCOVE_SHELVES]

/* ---------- مبلمان ---------- */
export const FURNITURE = {
  island: {
    position: [0, 0, -0.6] as Vec3,
    radius: 1.3,
    topY: 0.81,        // سطح شیشه‌ای (برای محصولات روز ۵)
    tier2Y: 1.16,      // سطح پایه بالایی
    tier2Radius: 0.5,
  },
  counter: {
    position: [4.0, 0, 2.4] as Vec3,
    rotationY: Math.PI, // جلوی پیشخوان رو به مشتری (جهت -Z)
    size: [2.8, 1.05, 0.8] as Vec3,
  },
} as const

export const MIRRORS = [
  { id: 'm-front-l', position: [-3.5, 1.9, D / 2] as Vec3, rotationY: Math.PI, width: 0.9, height: 1.6 },
  { id: 'm-front-r', position: [3.5, 1.9, D / 2] as Vec3, rotationY: Math.PI, width: 0.9, height: 1.6 },
  { id: 'm-back-l', position: [-1.7, 1.95, -D / 2] as Vec3, rotationY: 0, width: 0.9, height: 1.5 },
  { id: 'm-back-r', position: [1.7, 1.95, -D / 2] as Vec3, rotationY: 0, width: 0.9, height: 1.5 },
]

export const PLANTS = [
  { id: 'p-door-l', position: [-1.9, 0, 4.05] as Vec3, scale: 1.6 },
  { id: 'p-door-r', position: [1.9, 0, 4.05] as Vec3, scale: 1.6 },
  { id: 'p-corner', position: [-5.05, 0, 4.0] as Vec3, scale: 1.4 },
]

export const POUFS = [
  { id: 'pouf-1', position: [-2.7, 0, 0.5] as Vec3 },
  { id: 'pouf-2', position: [2.7, 0, 0.5] as Vec3 },
]

/* ---------- نقاط دید: دکمه‌های تلپورت و نقطه شروع ---------- */
export type ViewId = 'entrance' | ZoneId

export interface Viewpoint {
  id: ViewId
  label: string
  /** جایگاه ایستادن [x, z]؛ ارتفاع چشم خودکار از STORE.eyeHeight می‌آید */
  position: [number, number]
  /** نقطه‌ای که به آن نگاه می‌کنیم [x, y, z] */
  lookAt: Vec3
}

export const VIEWPOINTS: Viewpoint[] = [
  { id: 'entrance',  label: 'ورودی',        position: [0, D / 2 - 1.1], lookAt: [0, 1.45, -3] },
  { id: 'skincare',  label: 'مراقبت پوست',  position: [-3.3, -0.6],     lookAt: [-5.7, 1.35, -0.6] },
  { id: 'makeup',    label: 'آرایش',         position: [0, -2.8],        lookAt: [0, 1.3, -4.2] },
  { id: 'fragrance', label: 'عطر',           position: [3.3, -2.6],      lookAt: [5.7, 1.35, -2.4] },
  { id: 'body',      label: 'بدن و مو',      position: [3.3, -0.3],      lookAt: [5.7, 1.35, 0.65] },
  { id: 'checkout',  label: 'صندوق',         position: [3.6, 1.0],       lookAt: [4.0, 0.95, 2.4] },
]

export const START_VIEW = VIEWPOINTS[0]!