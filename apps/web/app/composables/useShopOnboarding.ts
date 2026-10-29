// app/composables/useShopOnboarding.ts
import { ref } from 'vue'

const KEY = 'shop3d:onboarded'
const visible = ref(false)

export function useShopOnboarding() {
  return {
    visible,
    shouldAutoShow() {
      try { return !localStorage.getItem(KEY) } catch { return true }
    },
    open() { visible.value = true },
    finish(completed: boolean) {
      visible.value = false
      try { localStorage.setItem(KEY, completed ? 'done' : 'skipped') } catch { /* ignore */ }
    },
  }
}