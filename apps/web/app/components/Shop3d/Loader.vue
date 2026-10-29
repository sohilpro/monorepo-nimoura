<!-- app/components/shop3d/Loader.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { sceneReady, ready, done, shown, stage } = useShopLoading()
const slow = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

const percent = computed(() => Math.round(shown.value * 100))

watch(ready, (r) => {
  if (r) timers.push(setTimeout(() => (done.value = true), 350))
}, { immediate: true })

onMounted(() => {
  // اگر گیر کرد: بعد از ۱۲ ثانیه لینک نسخه ساده، بعد از ۲۰ ثانیه ورود اجباری (عکس‌ها در پس‌زمینه ادامه می‌دهند)
  timers.push(setTimeout(() => (slow.value = true), 12_000))
  timers.push(setTimeout(() => { if (sceneReady.value) done.value = true }, 20_000))
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <Transition leave-active-class="transition-opacity duration-700" leave-to-class="opacity-0">
    <div
      v-if="!done"
      dir="rtl"
      class="absolute inset-0 z-40 grid place-items-center bg-nimoura-velvet px-6 text-nimoura-base"
      role="progressbar"
      aria-label="بارگذاری مغازه"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="percent"
    >
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(183_110_121/0.22),transparent_60%)]" />

      <div class="relative w-full max-w-xs text-center">
        <p
          dir="ltr"
          class="text-4xl tracking-[0.35em] text-nimoura-primary"
          style="font-family: Georgia, 'Times New Roman', serif"
        >
          NIMOURA
        </p>
        <p dir="ltr" class="mt-2 text-[11px] tracking-[0.4em] text-nimoura-text-300">BEAUTY BOUTIQUE</p>

        <div class="mt-10 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full bg-gradient-to-l from-nimoura-accent to-nimoura-primary transition-[width] duration-500 ease-out"
            :style="{ width: `${percent}%` }"
          />
        </div>
        <p class="mt-3 text-sm tabular-nums">{{ percent.toLocaleString('fa-IR') }}٪</p>
        <p class="mt-1 text-xs text-nimoura-text-300">{{ stage }}</p>

        <NuxtLink
          v-if="slow"
          to="/"
          class="mt-8 inline-block text-xs text-nimoura-accent underline underline-offset-4"
        >
          رفتن به نسخه ساده
        </NuxtLink>
      </div>
    </div>
  </Transition>
</template>