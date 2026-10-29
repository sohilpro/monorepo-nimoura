<!-- app/components/shop3d/ProductTooltip.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const catalog = useShopCatalog()
const { hoverIndex, selectedIndex, tooltip, successFlash } = useShopInteraction()

const hovered = computed(() =>
  selectedIndex.value === null && hoverIndex.value >= 0
    ? (catalog.instances.value[hoverIndex.value]?.product ?? null)
    : null,
)

const checkOn = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(successFlash, (f) => {
  if (!f) return
  checkOn.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (checkOn.value = false), 1300)
})
onBeforeUnmount(() => clearTimeout(timer))

const pos = computed(() => `translate(${tooltip.value.x}px, ${tooltip.value.y}px)`)
</script>

<template>
  <!-- برچسب هاور -->
  <div
    v-if="hovered && tooltip.visible"
    dir="rtl"
    class="pointer-events-none absolute top-0 left-0 z-20 will-change-transform"
    :style="{ transform: `${pos} translate(-50%, calc(-100% - 14px))` }"
  >
    <div class="max-w-56 rounded-2xl bg-nimoura-velvet/90 px-3 py-2 text-nimoura-base shadow-xl backdrop-blur">
      <p class="line-clamp-2 text-xs leading-5">{{ hovered.title }}</p>
      <p v-if="!hovered.available" class="mt-0.5 text-xs text-nimoura-accent">ناموجود</p>
      <p v-else class="mt-0.5 flex items-center gap-2 text-xs">
        <span class="font-semibold">{{ formatPrice(hovered.finalPrice) }}</span>
        <span
          v-if="hovered.discountPercent > 0"
          class="rounded-full bg-nimoura-primary px-1.5 py-0.5 text-[10px] text-white"
        >
          {{ hovered.discountPercent.toLocaleString('fa-IR') }}٪
        </span>
      </p>
    </div>
  </div>

  <!-- تیک موفقیت -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="scale-50 opacity-0"
    leave-active-class="transition duration-300"
    leave-to-class="opacity-0"
  >
    <div
      v-if="checkOn && tooltip.visible"
      class="pointer-events-none absolute top-0 left-0 z-20"
      :style="{ transform: `${pos} translate(-50%, calc(-100% - 10px))` }"
    >
      <div class="grid size-9 place-items-center rounded-full bg-nimoura-success text-white shadow-lg">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </div>
    </div>
  </Transition>
</template>