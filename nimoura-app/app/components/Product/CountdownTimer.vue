<!-- components/Product/CountdownTimer.vue -->
<template>
  <div class="flex font-modam items-center gap-1 text-white" dir="ltr">
    <div class="flex flex-col items-center">
      <span
        class="bg-white/20 rounded px-1.5 py-0.5 text-sm font-bold tabular-nums"
      >
        {{ pad(time.hours) }}
      </span>
    </div>
    <span class="font-bold text-sm">:</span>
    <div class="flex flex-col items-center">
      <span
        class="bg-white/20 rounded px-1.5 py-0.5 text-sm font-bold tabular-nums"
      >
        {{ pad(time.minutes) }}
      </span>
    </div>
    <span class="font-bold text-sm">:</span>
    <div class="flex flex-col items-center">
      <span
        class="bg-white/20 rounded px-1.5 py-0.5 text-sm font-bold tabular-nums"
      >
        {{ pad(time.seconds) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  days: number;
}>();

const now = () => Math.floor(Date.now() / 1000);

const endTime = useLocalStorage(
  "nimoura_amazing_timer",
  now() + props.days * 24 * 60 * 60,
);

const totalSeconds = ref(0);

const pad = (n: number) => String(n).padStart(2, "0");

const time = computed(() => ({
  hours: Math.floor(totalSeconds.value / 3600),
  minutes: Math.floor((totalSeconds.value % 3600) / 60),
  seconds: totalSeconds.value % 60,
}));

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  const remaining = endTime.value - now();

  if (remaining > 0) {
    totalSeconds.value = remaining;
  } else {
    // دوره جدید
    endTime.value = now() + props.days * 24 * 60 * 60;
    totalSeconds.value = props.days * 24 * 60 * 60;
  }

  timer = setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--;
    } else {
      endTime.value = now() + props.days * 24 * 60 * 60;
      totalSeconds.value = props.days * 24 * 60 * 60;
    }
  }, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>
