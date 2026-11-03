<template>
  <CommonRichTextEditor
    v-bind="$attrs"
    :model-value="modelValue"
    placeholder="متن کامل مقاله را همینجا بنویسید..."
    min-height="400px"
    owner-type="article_content"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  {
    modelValue: '',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
