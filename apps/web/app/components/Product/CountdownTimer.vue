<!-- components/Product/CountdownTimer.vue -->
<template>
  <ClientOnly>
    <div class="flex items-center gap-1 font-modam text-white" dir="ltr">
      <span
        class="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tabular-nums sm:text-sm"
      >
        {{ pad(time.hours) }}
      </span>
      <span class="text-xs font-bold sm:text-sm">:</span>
      <span
        class="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tabular-nums sm:text-sm"
      >
        {{ pad(time.minutes) }}
      </span>
      <span class="text-xs font-bold sm:text-sm">:</span>
      <span
        class="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tabular-nums sm:text-sm"
      >
        {{ pad(time.seconds) }}
      </span>
    </div>

    <template #fallback>
      <div class="flex items-center gap-1 font-modam text-white/80" dir="ltr">
        <span class="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tabular-nums sm:text-sm">24</span>
        <span class="text-xs font-bold sm:text-sm">:</span>
        <span class="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tabular-nums sm:text-sm">00</span>
        <span class="text-xs font-bold sm:text-sm">:</span>
        <span class="rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tabular-nums sm:text-sm">00</span>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const STORAGE_KEY = "nimoura_amazing_timer";

const props = withDefaults(
  defineProps<{
    days?: number;
  }>(),
  {
    days: 1,
  },
);

const totalSeconds = ref(props.days * 24 * 60 * 60);

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

const time = computed(() => ({
  hours: Math.floor(totalSeconds.value / 3600),
  minutes: Math.floor((totalSeconds.value % 3600) / 60),
  seconds: totalSeconds.value % 60,
}));

let timer: ReturnType<typeof setInterval> | null = null;

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function resetCycle(): number {
  const duration = Math.max(1, props.days) * 24 * 60 * 60;
  const target = nowSeconds() + duration;
  try {
    localStorage.setItem(STORAGE_KEY, String(target));
  } catch {
    // ignore storage quota errors
  }
  return duration;
}

onMounted(() => {
  let remaining = 0;
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored > nowSeconds()) {
      remaining = stored - nowSeconds();
    }
  } catch {
    // ignore storage read errors
  }

  totalSeconds.value = remaining > 0 ? remaining : resetCycle();

  timer = setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--;
    } else {
      totalSeconds.value = resetCycle();
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
