<!-- app/components/shop3d/MiniCart.vue -->
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const cart = useShopCart()
const { lines, count, total, connected } = cart

const open = ref(false)
const bump = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(count, (n, o) => {
  if (n > o) {
    bump.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (bump.value = false), 450)
  }
  if (n === 0) open.value = false
})
onBeforeUnmount(() => clearTimeout(timer))

const busy = ref(false)
async function run(fn: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  try { await fn() } catch (e) { console.error('[shop3d] cart', e) } finally { busy.value = false }
}
</script>

<template>
  <div dir="rtl" class="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full bg-nimoura-base/90 py-2 ps-3 pe-4 text-sm text-nimoura-text-800 shadow-lg backdrop-blur transition hover:bg-nimoura-base"
      :class="bump ? 'scale-110' : 'scale-100'"
      :aria-expanded="open"
      aria-label="سبد خرید"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 7h12l-1 12H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span class="font-semibold">{{ count.toLocaleString('fa-IR') }}</span>
      <span v-if="count > 0" class="hidden text-xs text-nimoura-text-600 sm:inline">{{ formatPrice(total) }}</span>
    </button>

    <p v-if="!connected && count > 0" class="rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] text-white">
      سبد آزمایشی (به سبد واقعی وصل نیست)
    </p>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="open && count > 0"
        class="w-[min(20rem,calc(100vw-2rem))] rounded-3xl bg-nimoura-base/95 p-3 text-nimoura-text-800 shadow-2xl backdrop-blur-md"
      >
        <ul class="max-h-[45dvh] space-y-2 overflow-y-auto">
          <li v-for="l in lines" :key="l.key" class="flex items-center gap-2.5">
            <div class="size-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-nimoura-border/50">
              <img v-if="l.image" :src="l.image" :alt="l.title" class="size-full object-contain" loading="lazy" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="line-clamp-1 text-xs">{{ l.title }}</p>
              <p v-if="l.variantLabel" class="text-[10px] text-nimoura-text-500">{{ l.variantLabel }}</p>
              <p class="text-xs font-semibold text-nimoura-velvet">{{ formatPrice(l.unitPrice * l.qty) }}</p>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="grid size-7 place-items-center rounded-full border border-nimoura-border text-sm disabled:opacity-40"
                :disabled="busy"
                :aria-label="l.qty === 1 ? 'حذف' : 'کم‌کردن'"
                @click="run(() => cart.setQty(l.key, l.qty - 1))"
              >
                {{ l.qty === 1 ? '×' : '−' }}
              </button>
              <span class="w-5 text-center text-xs">{{ l.qty.toLocaleString('fa-IR') }}</span>
              <button
                type="button"
                class="grid size-7 place-items-center rounded-full border border-nimoura-border text-sm disabled:opacity-40"
                :disabled="busy"
                aria-label="زیاد‌کردن"
                @click="run(() => cart.setQty(l.key, l.qty + 1))"
              >
                +
              </button>
            </div>
          </li>
        </ul>

        <div class="mt-3 flex items-center justify-between border-t border-nimoura-border/60 pt-3 text-sm">
          <span class="text-nimoura-text-600">جمع</span>
          <span class="font-bold text-nimoura-velvet">{{ formatPrice(total) }}</span>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <NuxtLink :to="SHOP_ROUTES.cart" class="rounded-full border border-nimoura-border py-2.5 text-center text-xs transition hover:border-nimoura-primary">
            مشاهده سبد
          </NuxtLink>
          <NuxtLink :to="SHOP_ROUTES.checkout" class="rounded-full bg-nimoura-primary py-2.5 text-center text-xs font-medium text-white transition hover:opacity-90">
            رفتن به صندوق
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>