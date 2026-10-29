// app/utils/theme3d.ts
import { Color } from 'three'

const FALLBACK = {
  primary: '#b76e79',
  base: '#fff8f4',
  accent: '#d9c6e2',
  border: '#c4c4c4',
  velvet: '#3b2f45',
  success: '#2fb57e',
  'text-100': '#e9e6e6',
  'text-200': '#cfc9c9',
  'text-300': '#b5adad',
  'text-400': '#9b9191',
  'text-500': '#807676',
  'text-600': '#665d5d',
  'text-700': '#4e4545',
  'text-800': '#3a3131',
  'text-900': '#272121',
} as const

export type TokenName = keyof typeof FALLBACK

export interface Theme3D {
  /** رنگ‌ها به‌صورت hex (برای prop های Tres و CSS) */
  hex: Record<TokenName, string>
  /** رنگ‌ها به‌صورت THREE.Color (برای محاسبات) */
  color: Record<TokenName, Color>
  /** رنگ‌های مشتق‌شده مخصوص صحنه */
  derived: {
    wall: string
    ceiling: string
    wainscot: string
    warmLight: string
    background: string
  }
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function readToken(name: TokenName): string {
  if (!import.meta.client) return FALLBACK[name]
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-nimoura-${name}`)
    .trim()
  return HEX.test(raw) ? raw : FALLBACK[name]
}

let cache: Theme3D | null = null

export function getTheme3D(): Theme3D {
  if (cache) return cache

  const names = Object.keys(FALLBACK) as TokenName[]
  const hex = {} as Record<TokenName, string>
  const color = {} as Record<TokenName, Color>

  for (const name of names) {
    hex[name] = readToken(name)
    color[name] = new Color(hex[name]) // hex ورودی sRGB است و three خودش تبدیل می‌کند
  }

  const mix = (a: TokenName, b: TokenName, t: number) =>
    '#' + color[a].clone().lerp(color[b], t).getHexString()

  cache = {
    hex,
    color,
    derived: {
      wall: mix('base', 'accent', 0.2),
      ceiling: hex.base,
      wainscot: mix('accent', 'base', 0.35),
      warmLight: mix('base', 'primary', 0.22),
      background: mix('velvet', 'text-900', 0.55),
    },
  }
  return cache
}

/**
 * رنگ درخشان برای Bloom: مقدار رنگ را از ۱ بالاتر می‌برد (HDR).
 * وقتی Bloom خاموش است رنگ عادی برمی‌گردد تا روی موبایل سفید نسوزد.
 */
export function glowColor(hex: string, strength: number, enabled: boolean): Color {
  const c = new Color(hex)
  return enabled ? c.multiplyScalar(strength) : c
}