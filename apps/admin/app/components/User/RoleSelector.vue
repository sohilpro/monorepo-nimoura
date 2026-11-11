<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="radiogroup" :aria-label="label">
      <button
        v-for="item in options"
        :key="item.value"
        type="button"
        role="radio"
        :aria-checked="modelValue === item.value"
        class="flex items-start gap-2.5 rounded-xl border p-3 text-start transition-all"
        :class="
          modelValue === item.value
            ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/15'
            : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50'
        "
        @click="emit('update:modelValue', item.value)"
      >
        <span
          class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
          :class="
            modelValue === item.value
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-500'
          "
        >
          <i :class="[item.icon, 'text-sm']" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-gray-800">
            {{ item.title }}
          </span>
          <span class="mt-0.5 block text-[11px] leading-4 text-gray-500">
            {{ item.desc }}
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '@nimoura/shared-types';

withDefaults(
  defineProps<{
    modelValue: UserRole;
    label?: string;
  }>(),
  {
    label: 'نقش دسترسی کاربر',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: UserRole];
}>();

const options = [
  {
    value: UserRole.USER,
    title: 'مشتری',
    desc: 'ثبت سفارش و مشاهده حساب کاربری',
    icon: 'pi pi-user',
  },
  {
    value: UserRole.ADMIN,
    title: 'مدیر (ادمین)',
    desc: 'دسترسی کامل به مدیریت فروشگاه',
    icon: 'pi pi-cog',
  },
  {
    value: UserRole.OWNER,
    title: 'مالک فروشگاه',
    desc: 'بالاترین سطح دسترسی و مدیریت',
    icon: 'pi pi-crown',
  },
];
</script>
