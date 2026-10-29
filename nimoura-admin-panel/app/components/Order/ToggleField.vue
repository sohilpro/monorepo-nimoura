<template>
  <div class="flex items-center justify-between gap-4">
    <span class="label">{{ label }}</span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue ? 'true' : 'false'"
      class="relative inline-flex h-6 w-11 items-center rounded-full transition"
      :class="modelValue ? 'bg-brand-500' : 'bg-neutral-300'"
      @click="toggle"
    >
      <span
        class="absolute left-1 h-4 w-4 rounded-full bg-white transition"
        :class="modelValue ? 'translate-x-6' : ''"
      ></span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: boolean; label?: string }>();
const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void }>();
function toggle() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<style scoped>
@reference "tailwindcss";
.label {
  @apply mb-1 block text-xs font-medium text-neutral-600;
}
</style>
