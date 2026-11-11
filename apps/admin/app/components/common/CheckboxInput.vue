<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-8">
      <div>
        <label
          :for="id"
          class="flex gap-2 items-center text-sm font-medium text-gray-700 cursor-pointer select-none"
        >
          <div class="relative">
            <input
              type="checkbox"
              :id="id"
              :checked="modelValue"
              :disabled="disabled"
              @change="onChange"
              class="sr-only"
            />
            <div
              :class="[
                'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]',
                modelValue
                  ? 'border-brand-500 bg-brand-500'
                  : 'bg-transparent border-gray-300',
                !disabled &&
                  'hover:border-brand-500',
                disabled && 'opacity-50 cursor-not-allowed',
              ]"
            >
              <span :class="modelValue ? '' : 'opacity-0'">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                    stroke="white"
                    stroke-width="1.94437"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          {{ label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { disabled, id, label, modelValue } = defineProps<{
  modelValue: any;
  label?: string;
  id?: any;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
};
</script>
