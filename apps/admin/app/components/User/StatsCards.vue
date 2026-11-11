<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <button
      v-for="card in cards"
      :key="card.key"
      type="button"
      class="group flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-start transition-all hover:-translate-y-0.5 hover:shadow-sm"
      :class="
        card.active
          ? 'border-brand-400 bg-brand-50/40 ring-2 ring-brand-500/15'
          : 'border-gray-200 hover:border-brand-200'
      "
      @click="emit('select', card.key)"
    >
      <div class="min-w-0">
        <p class="text-xs font-medium text-gray-500">{{ card.label }}</p>
        <p class="mt-1.5 text-2xl font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(card.value) }}
        </p>
      </div>
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        :class="card.iconBg"
      >
        <i :class="[card.icon, 'text-lg']" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { AdminUsersSummary } from '@nimoura/shared-types';
import { UserRole } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';

export type StatsFilterKey = 'all' | 'user' | 'staff' | 'verified';

const props = defineProps<{
  summary: AdminUsersSummary;
  activeRole?: UserRole | '';
  activeVerify?: string;
}>();

const emit = defineEmits<{
  select: [key: StatsFilterKey];
}>();

const cards = computed(() => [
  {
    key: 'all' as const,
    label: 'کل کاربران',
    value: props.summary.total,
    icon: 'pi pi-users',
    iconBg: 'bg-brand-50 text-brand-600',
    active: !props.activeRole && !props.activeVerify,
  },
  {
    key: 'user' as const,
    label: 'مشتریان فروشگاه',
    value: props.summary.users,
    icon: 'pi pi-shopping-bag',
    iconBg: 'bg-success-50 text-success-600',
    active: props.activeRole === UserRole.USER && !props.activeVerify,
  },
  {
    key: 'staff' as const,
    label: 'مدیران (ادمین)',
    value: props.summary.admins,
    icon: 'pi pi-shield',
    iconBg: 'bg-nimoura-accent/40 text-nimoura-velvet',
    active: props.activeRole === UserRole.ADMIN && !props.activeVerify,
  },
  {
    key: 'verified' as const,
    label: 'موبایل تأییدشده',
    value: props.summary.verifiedMobile,
    icon: 'pi pi-verified',
    iconBg: 'bg-blue-light-50 text-blue-light-600',
    active: props.activeVerify === 'mobile_true',
  },
]);
</script>
