<template>
  <div dir="ltr">
    <label
      class="mb-1.5 block text-sm font-medium text-end text-gray-700 dark:text-gray-400"
    >
      {{ label }}
    </label>
    <input
      type="text"
      :placeholder="placeholder"
      :value="formattedValue"
      @input="onInput"
      inputmode="numeric"
      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number;
  label?: string;
  placeholder?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const formattedValue = computed(() => {
  const val = props.modelValue?.toString().replace(/\D/g, "") || "";
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, "");
  emit("update:modelValue", raw);
}
</script>
