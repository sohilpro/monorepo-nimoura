// app/composables/useShopInteraction.ts
import { ref, shallowRef } from 'vue'
import type { InstancedMesh } from 'three'
import type { Vec3 } from '~/utils/storeDimensions'

export interface FocusRequest {
  pos: Vec3
  rotY: number
  /** روی موبایل کمی پایین‌تر را نگاه می‌کنیم تا محصول بالای کارت (bottom sheet) بماند */
  lookDrop: number
  stamp: number
}

const hoverIndex = ref(-1)
const selectedIndex = ref<number | null>(null)
const tooltip = ref({ x: 0, y: 0, visible: false })
const focusRequest = ref<FocusRequest | null>(null)
const successFlash = ref<{ index: number; stamp: number } | null>(null)
const productMesh = shallowRef<InstancedMesh | null>(null)

/** singleton؛ pickAt را ProductInteraction ثبت می‌کند و PlayerController صدا می‌زند */
const api = {
  hoverIndex,
  selectedIndex,
  tooltip,
  focusRequest,
  successFlash,
  productMesh,
  pickAt: null as null | ((clientX: number, clientY: number) => boolean),

  select(index: number, pos: Vec3, rotY: number) {
    selectedIndex.value = index
    const coarse = import.meta.client && matchMedia('(pointer: coarse)').matches
    focusRequest.value = { pos, rotY, lookDrop: coarse ? 0.25 : 0, stamp: Date.now() }
  },
  close() {
    selectedIndex.value = null
  },
  flashSuccess(index: number) {
    successFlash.value = { index, stamp: Date.now() }
  },
  reset() {
    hoverIndex.value = -1
    selectedIndex.value = null
    focusRequest.value = null
    successFlash.value = null
    tooltip.value = { x: 0, y: 0, visible: false }
    api.pickAt = null
  },
}

export function useShopInteraction() {
  return api
}