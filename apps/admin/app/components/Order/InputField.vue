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
    @reference "tailwindcss";
.input {
  @apply w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100;
}
.label {
  @apply mb-1 block text-xs font-medium text-neutral-600;
}
</style>
