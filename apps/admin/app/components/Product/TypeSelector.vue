<template>
  <CommonComponentCard title="نوع محصول">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="نوع محصول">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="modelValue === option.value"
        class="group relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-start transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 sm:flex-col sm:items-start sm:gap-2"
        :class="
          modelValue === option.value
            ? 'border-brand-500 bg-brand-50/60 shadow-sm'
            : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50'
        "
        @click="emit('update:modelValue', option.value)"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-lg transition"
          :class="modelValue === option.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600'"
        >
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path v-for="d in option.icon" :key="d" :d="d" />
          </svg>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-bold text-gray-900">{{ option.label }}</span>
          <span class="mt-0.5 block text-xs leading-5 text-gray-500">{{ option.description }}</span>
        </span>
        <span
          v-if="modelValue === option.value"
          class="absolute end-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-brand-500 text-white"
        >
          <svg class="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
        </span>
      </button>
    </div>
  </CommonComponentCard>
</template>

<script setup lang="ts">
import type { ProductType } from '@nimoura/shared-types';

defineProps<{ modelValue: ProductType }>();
const emit = defineEmits<{ 'update:modelValue': [type: ProductType] }>();

const options: Array<{ value: ProductType; label: string; description: string; icon: string[] }> = [
  {
    value: 'simple',
    label: 'محصول ساده',
    description: 'یک کالا با یک قیمت و یک موجودی',
    icon: ['M21 8l-9-5-9 5v8l9 5 9-5V8z', 'M3.3 7.5L12 12.5l8.7-5', 'M12 22V12.5'],
  },
  {
    value: 'variant',
    label: 'دارای تنوع',
    description: 'حجمی، وزنی یا رنگی؛ هر تنوع قیمت و موجودی جدا',
    icon: ['M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c1.9 0 3.6-1.6 3.6-3.5C21 6.9 17 3 12 3z', 'M7.5 11.5h.01', 'M10 7.5h.01', 'M14.5 7.5h.01'],
  },
  {
    value: 'bundle',
    label: 'پک (باندل)',
    description: 'ترکیبی از چند محصول با یک قیمت ویژه',
    icon: ['M20 12v9H4v-9', 'M2 7h20v5H2z', 'M12 21V7', 'M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7z', 'M12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z'],
  },
];
</script>
