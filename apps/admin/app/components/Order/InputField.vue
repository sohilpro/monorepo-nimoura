<template>
  <label class="block">
    <span v-if="label" class="label">
      {{ label }}<span v-if="required" class="text-rose-500"> *</span>
    </span>
    <input
      class="input"
      :dir="type === 'number' ? 'ltr' : undefined"
      :type="type"
      :value="modelValue as any"
      :placeholder="placeholder"
      :readonly="readonly"
      :pattern="pattern"
      @input="onInput"
    />
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    readonly?: boolean;
    pattern?: string;
  }>(),
  { type: "text" }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string | number): void;
}>();

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target?.value as any);
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
