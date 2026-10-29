<template>
  <p v-if="isCounting" class="text-sm text-nimoura-text-500">
    مانده تا دریافت مجدد کد
    <span class="font-modam font-medium text-nimoura-text-700">{{ formattedTime }}</span>
  </p>

  <Button
    v-else
    label="دریافت مجدد کد"
    link
    size="small"
    class="p-0! text-sm! text-nimoura-primary!"
    @click="handleResend"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  duration: number; // ثانیه
}>();

const emit = defineEmits<{
  (e: "resend"): void;
}>();

const remaining = ref(props.duration);
const isCounting = ref(true);
let timer: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const minutes = Math.floor(remaining.value / 60).toString();
  const seconds = (remaining.value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
});

function startTimer() {
  isCounting.value = true;
  remaining.value = props.duration;

  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--;
    } else {
      isCounting.value = false;
      if (timer) clearInterval(timer);
    }
  }, 1000);
}

function handleResend() {
  emit("resend");
  startTimer();
}

onMounted(startTimer);
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

watch(() => props.duration, startTimer);
</script>