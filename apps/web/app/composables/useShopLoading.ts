// app/composables/useShopLoading.ts
import { computed, ref } from 'vue'

const sceneReady = ref(false)
const built = ref(false) // چیدمان محصولات و اطلس ساخته شد
const done = ref(false)
const atlas = ref({ done: 0, total: 0 })

const GATE = 0.6 // درصد عکس‌هایی که برای بستن لودینگ لازم است
const MAX_BEFORE_GATE = 0.2 + 0.15 + 0.65 * GATE

export function useShopLoading() {
  const catalog = useShopCatalog()

  const progress = computed(() => {
    let p = sceneReady.value ? 0.2 : 0
    const st = catalog.status.value
    p += st === 'ready' || st === 'error' ? 0.15 : st === 'loading' ? 0.05 : 0
    if (built.value) {
      const a = atlas.value
      p += 0.65 * (a.total ? Math.min(1, a.done / a.total) : 1)
    }
    return Math.min(1, p)
  })

  const ready = computed(() => {
    if (!sceneReady.value) return false
    const st = catalog.status.value
    if (st === 'error') return true
    if (st !== 'ready' || !built.value) return false
    const a = atlas.value
    return a.total === 0 || a.done / a.total >= GATE
  })

  /** عددی که روی نوار نشان می‌دهیم (تا لحظه آماده‌شدن به ۱۰۰ نمی‌رسد) */
  const shown = computed(() => (ready.value ? 1 : Math.min(0.97, progress.value / MAX_BEFORE_GATE)))

  const stage = computed(() => {
    if (!sceneReady.value) return 'در حال ساخت مغازه…'
    if (catalog.status.value !== 'ready') return 'در حال دریافت محصولات…'
    if (!built.value) return 'در حال چیدن قفسه‌ها…'
    return 'در حال بارگذاری تصاویر محصولات…'
  })

  return {
    sceneReady, built, done, atlas, progress, ready, shown, stage,
    reset() {
      sceneReady.value = false
      built.value = false
      done.value = false
      atlas.value = { done: 0, total: 0 }
    },
  }
}