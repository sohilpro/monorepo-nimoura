<template>
  <div class="space-y-2">
    <ClientOnly>
      <label
        v-if="label"
        :for="id"
        class="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {{ label }}
      </label>

      <textarea
        :id="id"
        :value="modelValue"
        @input="(e) => $emit('update:modelValue', (e.target as HTMLTextAreaElement).value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :maxlength="maxlength"
        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).slice(2, 8)}`,
  },
  placeholder: {
    type: String,
    default: "متن خود را وارد کنید...",
  },
  rows: {
    type: Number,
    default: 6,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: 999,
  },
});

defineEmits(["update:modelValue"]);
</script>
