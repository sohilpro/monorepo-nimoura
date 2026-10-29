<template>
  <form @submit.prevent="onSubmit" id="category-form" class="space-y-8">
    <CommonComponentCard title="محتوا">
      <CommonCustomInput
        v-model="model.name"
        label="نام / عنوان دسته بندی"
        placeholder="لوازم آرایشی"
      />

      <CommonSelectInput
        v-model="model.parentId"
        :options="[{ id: null, name: 'بدون والد' }, ...categories]"
        label="دسته‌بندی والد"
        placeholder="جستجو در دسته‌بندی‌ها..."
      />
    </CommonComponentCard>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    name: string;
    parentId: number | null;
  };
  categories: { id: number; name: string }[];
  loading?: boolean;
  onSubmit: () => void;
}>();

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
