<template>
  <label class="block">
    <span v-if="label" class="label">{{ label }}</span>
    <select class="input" :value="modelValue" @change="onChange">
      <option v-for="o in options" :key="o.value" :value="o.value">
        {{ o.label }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
interface Opt {
  value: string;
  label: string;
}
const props = withDefaults(
  defineProps<{ modelValue?: string; label?: string; options?: Opt[] }>(),
  { options: () => [] }
);
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();

function onChange(e: Event) {
  emit("update:modelValue", (e.target as HTMLSelectElement)?.value || "");
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
