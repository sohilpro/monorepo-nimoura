<template>
  <div>
    <label
      class="mb-1.5 block text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>
    <input
      type="text"
      :placeholder="placeholder"
      v-model="model"
      class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  placeholder?: string;
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
