// app/composables/useShopControls.ts
import { ref } from 'vue'
import type { ViewId } from '~/utils/storeLayout'

/** بردار جوی‌استیک؛ غیر reactive چون هر فریم خوانده می‌شود. x: راست، y: جلو */
const joystick = { x: 0, y: 0 }

/** بخشی که کاربر الان در آن ایستاده (برای هایلایت دکمه منو) */
const activeZone = ref<ViewId | null>('entrance')
const request = ref<{ id: ViewId; stamp: number } | null>(null)
const interacted = ref(false)

export function useShopControls() {
  return {
    joystick,
    activeZone,
    request,
    interacted,
    goTo(id: ViewId) {
      interacted.value = true
      request.value = { id, stamp: Date.now() }
    },
    reset() {
      joystick.x = joystick.y = 0
      activeZone.value = 'entrance'
      request.value = null
      interacted.value = false
    },
  }
}