<template>
  <div class="relative w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <ClientOnly>
      <div class="relative">
        <Vue3PersianDatetimePicker
          :model-value="internalValue"
          @update:model-value="handleUpdate"
          :type="type"
          :format="format"
          :display-format="displayFormat"
          :placeholder="placeholder"
          :clearable="clearable"
          :disabled="disabled"
          :auto-submit="autoSubmit"
          :color="color"
          :simple="simple"
          :editable="editable"
          :input-class="computedInputClass"
        />
      </div>

      <template #fallback>
        <div
          class="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-3 text-xs text-gray-400"
        >
          در حال بارگذاری تقویم فارسی...
        </div>
      </template>
    </ClientOnly>

    <small v-if="errorMessage || invalidText" class="text-red-500 text-xs mt-1 block">
      {{ errorMessage || invalidText }}
    </small>
  </div>
</template>

<script setup lang="ts">
import Vue3PersianDatetimePicker from "vue3-persian-datetime-picker";

const props = withDefaults(
  defineProps<{
    modelValue?: string | Date | null;
    label?: string;
    placeholder?: string;
    type?: "date" | "datetime" | "time" | "year" | "month";
    format?: string;
    displayFormat?: string;
    clearable?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    errorMessage?: string;
    invalidText?: string;
    required?: boolean;
    autoSubmit?: boolean;
    color?: string;
    simple?: boolean;
    editable?: boolean;
  }>(),
  {
    type: "datetime",
    format: "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
    displayFormat: "jYYYY/jMM/jDD HH:mm",
    clearable: true,
    disabled: false,
    invalid: false,
    required: false,
    autoSubmit: false,
    color: "#2563eb",
    simple: false,
    editable: true,
    placeholder: "انتخاب تاریخ و ساعت...",
  }
);

const emit = defineEmits<{
  "update:modelValue": [val: string | null];
  change: [val: string | null];
}>();

const internalValue = computed(() => {
  if (!props.modelValue) return "";
  if (props.modelValue instanceof Date) {
    return props.modelValue.toISOString();
  }
  return String(props.modelValue);
});

const computedInputClass = computed(() => {
  const isErr = props.invalid || Boolean(props.errorMessage) || Boolean(props.invalidText);
  return [
    "w-full rounded-lg border px-3.5 py-2 text-sm transition-all duration-150",
    "bg-white text-gray-800 placeholder-gray-400 focus:outline-none",
    isErr
      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-gray-300 hover:border-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
    props.disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : "",
  ].join(" ");
});

function handleUpdate(val: string | null) {
  const finalVal = val && val.trim() !== "" ? val : null;
  emit("update:modelValue", finalVal);
  emit("change", finalVal);
}
</script>
