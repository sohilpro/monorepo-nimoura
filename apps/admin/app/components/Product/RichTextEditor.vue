<template>
  <CommonRichTextEditor
    v-bind="$attrs"
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder || 'توضیحات و معرفی محصول را بنویسید...'"
    :min-height="minHeight || '240px'"
    owner-type="product_description"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    placeholder?: string;
    minHeight?: string;
  }>(),
  {
    modelValue: '',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
