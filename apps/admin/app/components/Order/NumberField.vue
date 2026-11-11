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
.input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--color-gray-200, #ebe0df);
  background-color: #ffffff;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-gray-800, #3a3131);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.input::placeholder {
  color: var(--color-gray-400, #9b9191);
}
.input:focus {
  border-color: var(--color-brand-300, #e0a7b1);
  box-shadow: 0 0 0 3px rgba(183, 110, 121, 0.12);
}
.label {
  margin-bottom: 0.25rem;
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-gray-600, #665d5d);
}
</style>
