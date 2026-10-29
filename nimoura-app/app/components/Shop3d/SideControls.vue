<!-- app/components/shop3d/SideControls.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

const audio = useShopAudio()
const { successFlash } = useShopInteraction()
const { open } = useShopOnboarding()

onMounted(() => audio.init())
onBeforeUnmount(() => audio.shutdown())
watch(successFlash, (f) => { if (f) audio.chime() })

async function toggleSound() {
  const on = await audio.toggle()
  shopTrack('shop3d_sound', { on })
}
</script>

<template>
  <div class="absolute top-[4.5rem] right-4 z-10 flex flex-col gap-2">
    <button
      v-if="audio.supported.value"
      type="button"
      data-shop3d-sound
      class="grid size-11 place-items-center rounded-full bg-nimoura-base/90 text-nimoura-text-800 shadow-lg backdrop-blur transition hover:bg-nimoura-base"
      :aria-pressed="audio.active.value"
      :aria-label="audio.active.value ? 'خاموش‌کردن صدا' : 'روشن‌کردن صدا'"
      @click="toggleSound"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path v-if="audio.active.value" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        <path v-else d="m16 9 5 6m0-6-5 6" />
      </svg>
    </button>

    <button
      type="button"
      class="grid size-11 place-items-center rounded-full bg-nimoura-base/90 text-nimoura-text-800 shadow-lg backdrop-blur transition hover:bg-nimoura-base"
      aria-label="راهنما"
      @click="open()"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" />
      </svg>
    </button>
  </div>
</template>