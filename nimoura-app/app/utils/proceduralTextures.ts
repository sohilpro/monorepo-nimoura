// app/utils/proceduralTextures.ts
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import type { Theme3D } from './theme3d'

export function createFloorTexture(theme: Theme3D, repeat: [number, number]) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  // پایه
  ctx.fillStyle = theme.hex.base
  ctx.fillRect(0, 0, size, size)

  // رگه‌های مرمری خیلی کم‌رنگ
  ctx.globalAlpha = 0.05
  ctx.strokeStyle = theme.hex['text-400']
  ctx.lineWidth = 1.5
  for (let i = 0; i < 7; i++) {
    const y = Math.random() * size
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(
      size * 0.3, y + (Math.random() * 80 - 40),
      size * 0.6, y + (Math.random() * 80 - 40),
      size, y + (Math.random() * 120 - 60),
    )
    ctx.stroke()
  }

  // ذرات ریز
  ctx.fillStyle = theme.hex['text-500']
  for (let i = 0; i < 300; i++) {
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5)
  }

  // درز کاشی
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = theme.hex.border
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, size - 3, size - 3)
  ctx.globalAlpha = 1

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** تابلوی «NIMOURA» با کانواس؛ بدون فایل تصویر و بدون فونت خارجی */
export function createSignTexture(
  theme: Theme3D,
  title = 'NIMOURA',
  subtitle = 'BEAUTY BOUTIQUE',
) {
  const w = 1024
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'

  // رسم حرف‌به‌حرف تا فاصله حروف در همه مرورگرها (حتی Safari) یکسان باشد
  const spaced = (text: string, y: number, font: string, spacing: number, color: string) => {
    ctx.font = font
    ctx.fillStyle = color
    const widths = [...text].map((c) => ctx.measureText(c).width)
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
    let x = (w - total) / 2
    ;[...text].forEach((c, i) => {
      ctx.fillText(c, x, y)
      x += widths[i]! + spacing
    })
  }

  spaced(title, 100, '600 118px Georgia, "Times New Roman", serif', 26, theme.hex.primary)
  spaced(subtitle, 196, '400 34px Georgia, "Times New Roman", serif', 16, theme.hex['text-300'])

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/* ============ تکسچرهای مشترک (یک بار ساخته می‌شوند) ============ */
const shared: { glow?: CanvasTexture; sprite?: CanvasTexture } = {}

/** گرادیان عمودی: بالا روشن، پایین شفاف. برای نورتابش ریسه‌ها و نور سقف */
export function getGlowGradientTexture() {
  if (shared.glow) return shared.glow
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 128)
  shared.glow = new CanvasTexture(c)
  shared.glow.colorSpace = SRGBColorSpace
  return shared.glow
}

/** دایره نرم: برای ذرات گرد و غبار و هاله لوگو */
export function getSoftSpriteTexture() {
  if (shared.sprite) return shared.sprite
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  shared.sprite = new CanvasTexture(c)
  shared.sprite.colorSpace = SRGBColorSpace
  return shared.sprite
}

export function disposeSharedTextures() {
  shared.glow?.dispose()
  shared.sprite?.dispose()
  shared.glow = shared.sprite = undefined
}

/**
 * سایه تماسی نرم (سفید با آلفا؛ رنگ نهایی از متریال می‌آید).
 * اندازه تکسچر با اندازه واقعی جسم یکی است تا لبه سایه همه‌جا یک عرض داشته باشد.
 */
export function createContactShadowTexture(w: number, d: number, round: boolean, margin = 0.2) {
  const ppm = 96 // پیکسل در هر متر
  const cw = Math.ceil((w + margin * 2) * ppm)
  const ch = Math.ceil((d + margin * 2) * ppm)
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!

  // ترفند سازگار با همه مرورگرها (حتی Safari): شکل را بیرون کادر می‌کشیم
  // و فقط سایه‌ی بلورشده‌اش را داخل کادر می‌اندازیم.
  const off = cw + ch
  ctx.shadowColor = 'rgba(255,255,255,1)'
  ctx.shadowBlur = margin * ppm * 0.9
  ctx.shadowOffsetX = off
  ctx.fillStyle = '#fff'

  const x = margin * ppm - off
  const y = margin * ppm
  const rw = w * ppm
  const rh = d * ppm
  ctx.beginPath()
  if (round) ctx.ellipse(x + rw / 2, y + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2)
  else ctx.rect(x, y, rw, rh)
  ctx.fill()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** آسمان غروب بیرون در (دیده‌شدن از داخل مغازه) */
export function createOutsideTexture(theme: Theme3D) {
  const w = 16
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const mix = (a: keyof Theme3D['color'], b: keyof Theme3D['color'], t: number) =>
    '#' + theme.color[a].clone().lerp(theme.color[b], t).getHexString()

  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, theme.hex.velvet)
  g.addColorStop(0.55, mix('velvet', 'primary', 0.55))
  g.addColorStop(1, mix('primary', 'base', 0.45))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}