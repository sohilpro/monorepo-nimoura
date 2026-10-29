// app/utils/storeColliders.ts
import { STORE } from './storeDimensions'
import { ALL_SHELVES, FURNITURE, PLANTS, POUFS } from './storeLayout'

export interface BoxCollider { type: 'box'; minX: number; maxX: number; minZ: number; maxZ: number }
export interface CircleCollider { type: 'circle'; x: number; z: number; r: number }
export type Collider = BoxCollider | CircleCollider

export const PLAYER_RADIUS = 0.3

/** محدوده داخلی مغازه (سطح داخلی دیوارها) */
export const WALK_BOUNDS = {
  minX: -STORE.width / 2,
  maxX: STORE.width / 2,
  minZ: -STORE.depth / 2,
  maxZ: STORE.depth / 2,
}

/** مستطیل چرخیده (مضرب ۹۰ درجه) → کادر محوری */
function box(cx: number, cz: number, w: number, d: number, rotY: number): BoxCollider {
  const c = Math.abs(Math.cos(rotY))
  const s = Math.abs(Math.sin(rotY))
  const hx = (c * w + s * d) / 2
  const hz = (s * w + c * d) / 2
  return { type: 'box', minX: cx - hx, maxX: cx + hx, minZ: cz - hz, maxZ: cz + hz }
}

const circle = (x: number, z: number, r: number): CircleCollider => ({ type: 'circle', x, z, r })

const { island, counter } = FURNITURE

export const COLLIDERS: Collider[] = [
  ...ALL_SHELVES.map((s) => box(s.position[0], s.position[2], s.width, s.depth, s.rotationY)),
  circle(island.position[0], island.position[2], island.radius),
  box(counter.position[0], counter.position[2], counter.size[0] + 0.1, counter.size[2] + 0.1, counter.rotationY),
  ...POUFS.map((p) => circle(p.position[0], p.position[2], 0.34)),
  ...PLANTS.map((p) => circle(p.position[0], p.position[2], 0.17 * p.scale)),
]

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

/** موقعیت (mutate می‌شود) را از دیوارها و موانع بیرون می‌راند */
export function resolveCollisions(p: { x: number; z: number }, r = PLAYER_RADIUS) {
  for (let pass = 0; pass < 3; pass++) {
    p.x = clamp(p.x, WALK_BOUNDS.minX + r, WALK_BOUNDS.maxX - r)
    p.z = clamp(p.z, WALK_BOUNDS.minZ + r, WALK_BOUNDS.maxZ - r)

    for (const c of COLLIDERS) {
      if (c.type === 'circle') {
        const dx = p.x - c.x
        const dz = p.z - c.z
        const min = c.r + r
        const d2 = dx * dx + dz * dz
        if (d2 >= min * min) continue
        if (d2 < 1e-8) { p.z = c.z + min; continue }
        const d = Math.sqrt(d2)
        p.x = c.x + (dx / d) * min
        p.z = c.z + (dz / d) * min
      } else {
        const nx = clamp(p.x, c.minX, c.maxX)
        const nz = clamp(p.z, c.minZ, c.maxZ)
        const dx = p.x - nx
        const dz = p.z - nz
        const d2 = dx * dx + dz * dz
        if (d2 >= r * r) continue
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2)
          p.x = nx + (dx / d) * r
          p.z = nz + (dz / d) * r
        } else {
          // مرکز داخل کادر است: از نزدیک‌ترین ضلع خارج شو
          const l = p.x - c.minX
          const rt = c.maxX - p.x
          const u = p.z - c.minZ
          const dn = c.maxZ - p.z
          const m = Math.min(l, rt, u, dn)
          if (m === l) p.x = c.minX - r
          else if (m === rt) p.x = c.maxX + r
          else if (m === u) p.z = c.minZ - r
          else p.z = c.maxZ + r
        }
      }
    }
  }
}

/** آیا یک دایره به شعاع r در این نقطه به مانع یا دیوار می‌خورد؟ (برای مسیریابی) */
export function isBlocked(x: number, z: number, r = PLAYER_RADIUS): boolean {
  const rr = r - 0.002 // تلورانس عددی
  if (
    x < WALK_BOUNDS.minX + rr || x > WALK_BOUNDS.maxX - rr ||
    z < WALK_BOUNDS.minZ + rr || z > WALK_BOUNDS.maxZ - rr
  ) return true

  for (const c of COLLIDERS) {
    if (c.type === 'circle') {
      const dx = x - c.x
      const dz = z - c.z
      const min = c.r + rr
      if (dx * dx + dz * dz < min * min) return true
    } else {
      const dx = x - clamp(x, c.minX, c.maxX)
      const dz = z - clamp(z, c.minZ, c.maxZ)
      if (dx * dx + dz * dz < rr * rr) return true
    }
  }
  return false
}