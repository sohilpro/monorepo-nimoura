<template>
  <label class="block">
    <span v-if="label" class="label">{{ label }}</span>
    <textarea
      class="input min-h-24"
      :rows="Number(rows)"
      :value="modelValue || ''"
      @input="onInput"
    />
    <slot name="help" />
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    rows?: number | string;
  }>(),
  { rows: 3 }
);
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();

function onInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLTextAreaElement)?.value || "");
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
