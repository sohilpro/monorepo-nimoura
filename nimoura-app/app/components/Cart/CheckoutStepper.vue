<script setup lang="ts">
type StepKey = 'cart' | 'shipping' | 'payment';

const props = withDefaults(
  defineProps<{
    current?: StepKey;
  }>(),
  {
    current: 'cart',
  }
);

const steps: { key: StepKey; number: string; label: string }[] = [
  { key: 'cart', number: '۱', label: 'سبد خرید' },
  { key: 'shipping', number: '۲', label: 'اطلاعات ارسال' },
  { key: 'payment', number: '۳', label: 'پرداخت' },
];

const currentIndex = computed(() => steps.findIndex((s) => s.key === props.current));

function stepState(index: number): 'done' | 'active' | 'upcoming' {
  if (index < currentIndex.value) return 'done';
  if (index === currentIndex.value) return 'active';
  return 'upcoming';
}
</script>

<template>
  <div class="flex items-center justify-center gap-0.5 md:gap-3 mb-12 text-xs sm:text-sm">
    <template v-for="(step, index) in steps" :key="step.key">
      <div
        class="flex items-center gap-2 font-medium"
        :class="{
          'text-nimoura-primary': stepState(index) === 'done',
          'text-nimoura-text-900': stepState(index) === 'active',
          'text-nimoura-text-300 font-normal': stepState(index) === 'upcoming',
        }"
      >
        <span
          class="w-6 h-6 rounded-full font-modam flex items-center justify-center text-[11px]"
          :class="
            stepState(index) === 'upcoming'
              ? 'border border-nimoura-text-300 text-nimoura-text-300'
              : 'bg-nimoura-primary text-white'
          "
        >
          {{ step.number }}
        </span>
        {{ step.label }}
      </div>

      <div v-if="index < steps.length - 1" class="w-8 h-px bg-nimoura-text-200"></div>
    </template>
  </div>
</template>