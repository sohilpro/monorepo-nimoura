// app/composables/useShopAudio.ts
import { computed, ref } from 'vue'

const KEY = 'shop3d:sound'
const LEVEL = 0.5
const CHORD = [130.81, 196.0, 329.63, 493.88, 587.33] // C3 G3 E4 B4 D5 (Cmaj9)

const enabled = ref(false)
const armed = ref(false) // ترجیح «روشن» ذخیره شده و منتظر اولین تعامل است
const supported = ref(true)

let ctx: AudioContext | null = null
let master: GainNode | null = null
let suspendTimer: ReturnType<typeof setTimeout> | undefined
let disarm: (() => void) | null = null
let visBound = false

const readPref = () => {
  try { return localStorage.getItem(KEY) === 'on' } catch { return false }
}
const savePref = (on: boolean) => {
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* ignore */ }
}

function buildPad(c: AudioContext, out: AudioNode) {
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 800
  lp.Q.value = 0.5

  // echo نرم برای حس فضا
  const delay = c.createDelay(1.5)
  delay.delayTime.value = 0.42
  const fb = c.createGain()
  fb.gain.value = 0.38
  const wet = c.createGain()
  wet.gain.value = 0.5
  lp.connect(out)
  lp.connect(delay)
  delay.connect(fb)
  fb.connect(delay)
  delay.connect(wet)
  wet.connect(out)

  CHORD.forEach((f, i) => {
    const g = c.createGain()
    g.gain.value = 0.03
    const lfo = c.createOscillator()
    lfo.frequency.value = 0.04 + i * 0.017
    const depth = c.createGain()
    depth.gain.value = 0.02 // 0.03 ± 0.02 هرگز منفی نمی‌شود
    lfo.connect(depth)
    depth.connect(g.gain)
    for (const detune of [-5, 5]) {
      const o = c.createOscillator()
      o.type = i % 2 ? 'triangle' : 'sine'
      o.frequency.value = f
      o.detune.value = detune
      o.connect(g)
      o.start()
    }
    g.connect(lp)
    lfo.start()
  })
}

function ensure(): AudioContext | null {
  if (ctx) return ctx
  const AC = window.AudioContext || (window as any).webkitAudioContext
  if (!AC) {
    supported.value = false
    return null
  }
  ctx = new AC({ latencyHint: 'playback' }) as AudioContext
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  buildPad(ctx, master)
  return ctx
}

async function turnOn(): Promise<boolean> {
  const c = ensure()
  if (!c || !master) return false
  clearTimeout(suspendTimer)
  try { await c.resume() } catch { /* نیاز به تعامل کاربر */ }
  if (c.state !== 'running') return false
  master.gain.cancelScheduledValues(c.currentTime)
  master.gain.setTargetAtTime(LEVEL, c.currentTime, 1.2)
  enabled.value = true
  return true
}

function turnOff() {
  enabled.value = false
  if (!ctx || !master) return
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
  clearTimeout(suspendTimer)
  suspendTimer = setTimeout(() => {
    if (!enabled.value) ctx?.suspend().catch(() => {})
  }, 1200)
}

function armAuto() {
  if (disarm) return
  const handler = async (e: Event) => {
    // اگر کاربر روی خود دکمه صدا زد، toggle خودش کار را انجام می‌دهد
    if ((e.target as Element | null)?.closest?.('[data-shop3d-sound]')) return
    if (await turnOn()) disarm?.()
  }
  const events = ['pointerdown', 'pointerup', 'keydown'] as const
  events.forEach((ev) => window.addEventListener(ev, handler, true))
  armed.value = true
  disarm = () => {
    events.forEach((ev) => window.removeEventListener(ev, handler, true))
    armed.value = false
    disarm = null
  }
}

function onVisibility() {
  if (!ctx) return
  if (document.hidden) ctx.suspend().catch(() => {})
  else if (enabled.value) ctx.resume().catch(() => {})
}

export function useShopAudio() {
  const active = computed(() => enabled.value || armed.value)

  return {
    enabled, active, supported,

    init() {
      if (!import.meta.client) return
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        supported.value = false
        return
      }
      if (!visBound) {
        visBound = true
        document.addEventListener('visibilitychange', onVisibility)
      }
      if (readPref()) armAuto()
    },

    async toggle(): Promise<boolean> {
      if (active.value) {
        disarm?.()
        turnOff()
        savePref(false)
        return false
      }
      const ok = await turnOn()
      savePref(ok)
      return ok
    },

    /** زنگ کوتاه موفقیت (فقط وقتی صدا روشن است) */
    chime() {
      if (!enabled.value || !ctx || !master || ctx.state !== 'running') return
      const c = ctx
      const t = c.currentTime
      for (const [f, d] of [[880, 0], [1318.51, 0.09]] as const) {
        const o = c.createOscillator()
        o.type = 'sine'
        o.frequency.value = f
        const g = c.createGain()
        g.gain.setValueAtTime(0.0001, t + d)
        g.gain.exponentialRampToValueAtTime(0.16, t + d + 0.015)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.9)
        o.connect(g)
        g.connect(c.destination)
        o.start(t + d)
        o.stop(t + d + 1)
      }
    },

    shutdown() {
      disarm?.()
      clearTimeout(suspendTimer)
      if (visBound) {
        document.removeEventListener('visibilitychange', onVisibility)
        visBound = false
      }
      enabled.value = false
      const c = ctx
      ctx = null
      master = null
      c?.close().catch(() => {})
    },
  }
}