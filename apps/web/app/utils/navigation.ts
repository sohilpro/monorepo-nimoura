// app/utils/navigation.ts
import type { Vec3 } from './storeDimensions'
import { PLAYER_RADIUS, WALK_BOUNDS, isBlocked } from './storeColliders'

export interface Pt { x: number; z: number }

const CELL = 0.2
const CLEARANCE = PLAYER_RADIUS + 0.05 // فاصله امن تا مانع، تا مسیر به دیوار نچسبد
const COLS = Math.round((WALK_BOUNDS.maxX - WALK_BOUNDS.minX) / CELL)
const ROWS = Math.round((WALK_BOUNDS.maxZ - WALK_BOUNDS.minZ) / CELL)

let freeGrid: Uint8Array | null = null

const cellCenter = (ix: number, iz: number): Pt => ({
  x: WALK_BOUNDS.minX + (ix + 0.5) * CELL,
  z: WALK_BOUNDS.minZ + (iz + 0.5) * CELL,
})

function grid(): Uint8Array {
  if (freeGrid) return freeGrid
  const g = new Uint8Array(COLS * ROWS)
  for (let iz = 0; iz < ROWS; iz++) {
    for (let ix = 0; ix < COLS; ix++) {
      const c = cellCenter(ix, iz)
      g[iz * COLS + ix] = isBlocked(c.x, c.z, CLEARANCE) ? 0 : 1
    }
  }
  freeGrid = g
  return g
}

const toCell = (p: Pt) => ({
  ix: Math.min(COLS - 1, Math.max(0, Math.floor((p.x - WALK_BOUNDS.minX) / CELL))),
  iz: Math.min(ROWS - 1, Math.max(0, Math.floor((p.z - WALK_BOUNDS.minZ) / CELL))),
})

/** نزدیک‌ترین خانه آزاد (اگر کاربر روی قفسه یا جزیره کلیک کند) */
function nearestFree(ix: number, iz: number): number | null {
  const g = grid()
  let best = -1
  let bestD = Infinity
  for (let k = 0; k < 30; k++) {
    for (let dz = -k; dz <= k; dz++) {
      for (let dx = -k; dx <= k; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== k) continue
        const x = ix + dx
        const z = iz + dz
        if (x < 0 || z < 0 || x >= COLS || z >= ROWS || !g[z * COLS + x]) continue
        const d = dx * dx + dz * dz
        if (d < bestD) { bestD = d; best = z * COLS + x }
      }
    }
    if (best >= 0 && bestD <= (k + 1) * (k + 1)) break
  }
  return best >= 0 ? best : null
}

/** هیپ کمینه (کلید، مقدار) */
class MinHeap {
  private k: number[] = []
  private v: number[] = []
  get size() { return this.v.length }

  push(key: number, val: number) {
    let i = this.v.length
    this.k.push(key)
    this.v.push(val)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.k[p]! <= key) break
      this.k[i] = this.k[p]!
      this.v[i] = this.v[p]!
      i = p
    }
    this.k[i] = key
    this.v[i] = val
  }

  pop(): number {
    const top = this.v[0]!
    const key = this.k.pop()!
    const val = this.v.pop()!
    const n = this.v.length
    if (n > 0) {
      let i = 0
      for (;;) {
        let c = 2 * i + 1
        if (c >= n) break
        if (c + 1 < n && this.k[c + 1]! < this.k[c]!) c++
        if (this.k[c]! >= key) break
        this.k[i] = this.k[c]!
        this.v[i] = this.v[c]!
        i = c
      }
      this.k[i] = key
      this.v[i] = val
    }
    return top
  }
}

function clearLine(a: Pt, b: Pt): boolean {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08))
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    if (isBlocked(a.x + dx * t, a.z + dz * t, PLAYER_RADIUS - 0.01)) return false
  }
  return true
}

/** حذف نقاط اضافی: از هر نقطه تا دورترین نقطه‌ای که دید مستقیم دارد می‌رود */
function smooth(p: Pt[]): Pt[] {
  const out: Pt[] = [p[0]!]
  let i = 0
  while (i < p.length - 1) {
    let j = p.length - 1
    while (j > i + 1 && !clearLine(p[i]!, p[j]!)) j--
    out.push(p[j]!)
    i = j
  }
  return out
}

/** مسیر بدون برخورد از from تا to. اگر مقصد داخل مانع باشد، نزدیک‌ترین نقطه آزاد انتخاب می‌شود. */
export function findPath(from: Pt, to: Pt): Pt[] | null {
  const g = grid()
  const a = toCell(from)
  const b = toCell(to)
  const start = nearestFree(a.ix, a.iz)
  const goal = nearestFree(b.ix, b.iz)
  if (start === null || goal === null) return null

  const N = COLS * ROWS
  const gScore = new Float32Array(N).fill(Infinity)
  const parent = new Int32Array(N).fill(-1)
  const closed = new Uint8Array(N)
  const heap = new MinHeap()

  const gx = goal % COLS
  const gz = Math.floor(goal / COLS)
  const h = (n: number) => {
    const dx = Math.abs((n % COLS) - gx)
    const dz = Math.abs(Math.floor(n / COLS) - gz)
    return dx + dz + (Math.SQRT2 - 2) * Math.min(dx, dz)
  }

  gScore[start] = 0
  heap.push(h(start), start)

  while (heap.size) {
    const n = heap.pop()
    if (closed[n]) continue
    if (n === goal) break
    closed[n] = 1
    const nx = n % COLS
    const nz = Math.floor(n / COLS)

    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dz) continue
        const x = nx + dx
        const z = nz + dz
        if (x < 0 || z < 0 || x >= COLS || z >= ROWS) continue
        const m = z * COLS + x
        if (!g[m] || closed[m]) continue
        // برش گوشه ممنوع
        if (dx && dz && (!g[nz * COLS + x] || !g[z * COLS + nx])) continue
        const cost = gScore[n]! + (dx && dz ? Math.SQRT2 : 1)
        if (cost < gScore[m]!) {
          gScore[m] = cost
          parent[m] = n
          heap.push(cost + h(m), m)
        }
      }
    }
  }

  if (start !== goal && parent[goal] === -1) return null

  const cells: Pt[] = []
  for (let n = goal; n !== -1; n = parent[n]!) cells.push(cellCenter(n % COLS, Math.floor(n / COLS)))
  cells.reverse()

  const end = isBlocked(to.x, to.z) ? cells[cells.length - 1]! : { x: to.x, z: to.z }
  return smooth([{ x: from.x, z: from.z }, ...cells.slice(1, -1), end])
}

/* ---------- کمکی‌های حرکت روی مسیر ---------- */
export function measurePath(p: Pt[]) {
  const cum = [0]
  for (let i = 1; i < p.length; i++) {
    cum.push(cum[i - 1]! + Math.hypot(p[i]!.x - p[i - 1]!.x, p[i]!.z - p[i - 1]!.z))
  }
  return { cum, length: cum[cum.length - 1]! }
}

export function pointAlong(p: Pt[], cum: number[], d: number, out: Pt) {
  let i = 1
  while (i < cum.length - 1 && cum[i]! < d) i++
  const seg = cum[i]! - cum[i - 1]!
  const t = seg > 1e-6 ? Math.min(1, Math.max(0, (d - cum[i - 1]!) / seg)) : 1
  out.x = p[i - 1]!.x + (p[i]!.x - p[i - 1]!.x) * t
  out.z = p[i - 1]!.z + (p[i]!.z - p[i - 1]!.z) * t
}

/** زاویه‌های yaw/pitch برای نگاه‌کردن از یک نقطه به نقطه دیگر */
export function lookAngles(from: Vec3, to: Vec3) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dz = to[2] - from[2]
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }
}