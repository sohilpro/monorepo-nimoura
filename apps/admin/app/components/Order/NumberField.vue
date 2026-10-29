<template>
  <label class="block">
    <span v-if="label" class="label">{{ label }}</span>
    <div class="relative">
      <input
        class="input pr-10 ltr:font-mono no-arrow"
        type="number"
        :min="Number(min)"
        :value="modelValue as any"
        @input="onInput"
      />
      <span
        v-if="suffix"
        class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-neutral-500"
        >{{ suffix }}</span
      >
    </div>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    label?: string;
    suffix?: string;
    min?: number | string;
  }>(),
  { min: 0 }
);
const emit = defineEmits<{ (e: "update:modelValue", v: number): void }>();

function onInput(e: Event) {
  const v = Number((e.target as HTMLInputElement)?.value);
  emit("update:modelValue", isNaN(v) ? 0 : v);
}
</script>

<style scoped>
@reference "tailwindcss";
.input {
  @apply w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100;
}
.label {
  @apply mb-1 block text-xs font-medium text-neutral-600;
}
</style>
