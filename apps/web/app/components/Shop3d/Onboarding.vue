<!-- app/components/shop3d/Onboarding.vue -->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const route = useRoute()
const { visible, shouldAutoShow, finish } = useShopOnboarding()
const { done } = useShopLoading()

const touch = matchMedia('(pointer: coarse)').matches
const step = ref(0)
const primary = ref<HTMLButtonElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

const steps = [
  {
    icon: 'move',
    title: 'قدم بزن',
    text: touch
      ? 'با جوی‌استیک پایین‌چپ راه برو و روی صحنه بکش تا دور و برت را ببینی. روی زمین بزنی، خودکار می‌روی. دکمه‌های پایین صفحه هم تو را به بخش‌ها می‌برند.'
      : 'با کلیدهای W، A، S، D راه برو و موس را بکش تا دور و برت را ببینی. روی زمین کلیک کنی، خودکار می‌روی. دکمه‌های پایین صفحه هم تو را به بخش‌ها می‌برند.',
  },
  {
    icon: 'pointer',
    title: 'محصول را از نزدیک ببین',
    text: touch
      ? 'روی هر محصول بزن تا دوربین نزدیک شود و قیمت و جزئیاتش باز شود.'
      : 'روی هر محصول کلیک کن تا دوربین نزدیک شود و قیمت و جزئیاتش باز شود. با Esc برمی‌گردی.',
  },
  {
    icon: 'bag',
    title: 'سبد و خرید',
    text: 'از کارت محصول به سبد اضافه کن. سبد بالا سمت چپ است و همان سبد سایت است؛ از همان‌جا به صندوق می‌روی و پرداخت می‌کنی.',
  },
]

const last = computed(() => step.value === steps.length - 1)
const cur = computed(() => steps[step.value]!)

watch(
  done,
  (d) => {
    if (d && !route.query.product && shouldAutoShow()) {
      timer = setTimeout(() => { visible.value = true }, 700)
    }
  },
  { immediate: true },
)

watch(visible, async (v) => {
  if (!v) return
  step.value = 0
  shopTrack('shop3d_onboarding_open')
  await nextTick()
  primary.value?.focus()
})

function close(completed: boolean) {
  shopTrack(completed ? 'shop3d_onboarding_done' : 'shop3d_onboarding_skip', { step: step.value + 1 })
  finish(completed)
}
function next() {
  if (last.value) close(true)
  else step.value++
}

const onKey = (e: KeyboardEvent) => {
  if (visible.value && e.key === 'Escape') close(false)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(timer)
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      dir="rtl"
      class="absolute inset-0 z-[45] grid place-items-center bg-nimoura-velvet/65 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="راهنمای مغازه"
        class="w-[min(22rem,calc(100vw-2rem))] rounded-3xl bg-nimoura-base p-6 text-center text-nimoura-text-800 shadow-2xl"
      >
        <div class="mx-auto grid size-16 place-items-center rounded-full bg-nimoura-accent/50 text-nimoura-primary">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <template v-if="cur.icon === 'move'">
              <path d="M12 3v18M3 12h18M12 3 9 6m3-3 3 3M12 21l-3-3m3 3 3-3M3 12l3-3m-3 3 3 3M21 12l-3-3m3 3-3 3" />
            </template>
            <template v-else-if="cur.icon === 'pointer'">
              <path d="m5 3 14 7-6 2-2 6L5 3Z" />
            </template>
            <template v-else>
              <path d="M6 7h12l-1 12H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
            </template>
          </svg>
        </div>

        <h2 class="mt-4 text-lg font-bold text-nimoura-velvet">{{ cur.title }}</h2>
        <p class="mt-2 min-h-[7.5rem] text-sm leading-7 text-nimoura-text-600">{{ cur.text }}</p>

        <div class="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          <span
            v-for="(_, i) in steps"
            :key="i"
            class="h-1.5 rounded-full transition-all"
            :class="i === step ? 'w-5 bg-nimoura-primary' : 'w-1.5 bg-nimoura-border'"
          />
        </div>

        <div class="mt-5 flex items-center justify-between gap-2">
          <button
            v-if="step === 0"
            type="button"
            class="px-2 py-2 text-xs text-nimoura-text-500 underline underline-offset-4"
            @click="close(false)"
          >
            رد کردن
          </button>
          <button
            v-else
            type="button"
            class="px-2 py-2 text-xs text-nimoura-text-600"
            @click="step--"
          >
            قبلی
          </button>

          <button
            ref="primary"
            type="button"
            class="rounded-full bg-nimoura-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            @click="next"
          >
            {{ last ? 'شروع خرید' : 'بعدی' }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>