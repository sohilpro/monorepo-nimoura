<template>
  <div class="space-y-4">
    <label
      class="mb-1.5 block text-sm font-medium text-gray-700"
    >
      مشخثات و ویژگی محصول
    </label>
    <div
      v-for="(spec, index) in internalValue"
      :key="index"
      class="grid grid-cols-12 gap-2 items-center"
    >
      <input
        v-model="spec.key"
        type="text"
        class="col-span-5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
        placeholder="عنوان (مثلاً: حجم)"
      />
      <input
        v-model="spec.value"
        type="text"
        class="col-span-5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
        placeholder="مقدار (مثلاً: 50 میلی‌لیتر)"
      />
      <button
        type="button"
        class="col-span-2 text-red-500 text-sm"
        @click="removeSpec(index)"
      >
        حذف
      </button>
    </div>

    <button
      type="button"
      class="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md text-sm transition-all duration-300 mt-2"
      @click="addSpec"
    >
      افزودن ویژگی
    </button>
  </div>
</template>

<script setup lang="ts">
interface Specification {
  key: string;
  value: string;
}

const props = defineProps<{
  modelValue: Specification[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Specification[]): void;
}>();

// local copy to support v-model changes
const internalValue = ref<Specification[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    const isDifferent = JSON.stringify(newVal) !== JSON.stringify(internalValue.value)
    if (isDifferent) {
      internalValue.value = [...newVal]
    }
  },
  { immediate: true, deep: true }
)

watch(
  internalValue,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

const addSpec = () => {
  internalValue.value.push({ key: "", value: "" });
};

const removeSpec = (index: number) => {
  internalValue.value.splice(index, 1);
};
</script>
