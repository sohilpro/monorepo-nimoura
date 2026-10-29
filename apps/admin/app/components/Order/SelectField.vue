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
@reference "tailwindcss";
.input {
  @apply w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100;
}
.label {
  @apply mb-1 block text-xs font-medium text-neutral-600;
}
</style>
