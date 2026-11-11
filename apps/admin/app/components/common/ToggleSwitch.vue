<template>
  <label
    :for="id"
    class="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer select-none"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <div class="relative">
      <input
        type="checkbox"
        :id="id"
        class="sr-only"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />
      <div
        class="block h-6 w-11 rounded-full transition-colors duration-300 ease-in-out"
        :class="
          modelValue
            ? 'bg-brand-500'
            : 'bg-gray-200'
        "
      ></div>
      <div
        class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-theme-sm transition-all duration-300 ease-linear"
        :class="modelValue ? 'translate-x-full' : 'translate-x-0'"
      ></div>
    </div>
    {{ label }}
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  id: string;
  label: string;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
};
</script>
