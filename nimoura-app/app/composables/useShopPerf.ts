// app/composables/useShopPerf.ts
import { ref } from 'vue'

const fps = ref(0)
const calls = ref(0)
const tris = ref(0)
const textures = ref(0)
const canvasPx = ref('')
const hud = ref(false)
/** ضریب pixel ratio که کنترلر تطبیقی کم می‌کند (۱ = بدون کاهش) */
const scale = ref(1)
const dustOff = ref(false)
const suggest = ref<null | 'lite' | 'simple'>(null)
const stopped = ref(false)
const contextLost = ref(false)
let inited = false

export function useShopPerf() {
  if (!inited && import.meta.client) {
    inited = true
    scale.value = storedScale(useShopQuality().tier)
  }
  return {
    fps, calls, tris, textures, canvasPx, hud, scale, dustOff, suggest, stopped, contextLost,
    reset() {
      suggest.value = null
      stopped.value = false
      contextLost.value = false
      dustOff.value = false
      fps.value = 0
    },
  }
}