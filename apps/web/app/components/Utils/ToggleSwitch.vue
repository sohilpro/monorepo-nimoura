<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label: string;
  id: string;
}>();

const emit = defineEmits(["update:modelValue"]);

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
}
</script>

<template>
  <div class="w-full flex items-center justify-between gap-x-3 px-2 xl:px-4 py-4">
    <label :for="props.id" class="text-sm text-nimoura-text-800 cursor-pointer">
      {{ props.label }}
    </label>

    <label :for="props.id" class="relative inline-block h-6 w-11 cursor-pointer" dir="ltr">
      <input
        :id="props.id"
        type="checkbox"
        :checked="props.modelValue"
        class="peer sr-only"
        @change="handleChange"
      />
      <span
        class="absolute inset-0 rounded-full bg-nimoura-text-100 transition-colors duration-200 ease-in-out peer-checked:bg-nimoura-primary"
      />
      <span
        class="absolute top-1/2 start-0.5 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full"
      />
    </label>
  </div>
</template>