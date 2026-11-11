<template>
  <CommonComponentCard title="خلاصه وضعیت حساب">
    <div class="flex items-center gap-3.5">
      <span class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">
        {{ getInitials(user) }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-base font-bold text-gray-900">
          {{ getDisplayName(user) }}
        </p>
        <div class="mt-1 flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
            :class="getRoleBadgeClass(user.role)"
          >
            {{ getRoleLabel(user.role) }}
          </span>
          <span class="text-xs tabular-nums text-gray-400">
            شناسه #{{ toPersianDigits(user.id) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="stats" class="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
      <div class="rounded-xl bg-gray-50 p-2.5">
        <p class="text-lg font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(stats.ordersCount) }}
        </p>
        <p class="text-[11px] text-gray-500">سفارش</p>
      </div>
      <div class="rounded-xl bg-gray-50 p-2.5">
        <p class="text-lg font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(stats.addressesCount) }}
        </p>
        <p class="text-[11px] text-gray-500">آدرس</p>
      </div>
      <div class="rounded-xl bg-gray-50 p-2.5">
        <p class="text-lg font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(stats.commentsCount) }}
        </p>
        <p class="text-[11px] text-gray-500">دیدگاه</p>
      </div>
    </div>

    <dl class="space-y-2 border-t border-gray-100 pt-4 text-xs">
      <div class="flex items-center justify-between">
        <dt class="text-gray-500">تاریخ عضویت</dt>
        <dd class="font-medium tabular-nums text-gray-800">
          {{ formatDate(user.createdAt) || '—' }}
        </dd>
      </div>
      <div class="flex items-center justify-between">
        <dt class="text-gray-500">آخرین ویرایش</dt>
        <dd class="font-medium tabular-nums text-gray-800">
          {{ formatDate(user.updatedAt) || '—' }}
        </dd>
      </div>
    </dl>

    <div class="border-t border-gray-100 pt-4">
      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-error-200 bg-error-50/70 px-4 py-2.5 text-xs font-semibold text-error-700 transition hover:bg-error-100"
        @click="emit('delete')"
      >
        <i class="pi pi-trash text-xs" />
        حذف این کاربر
      </button>
    </div>
  </CommonComponentCard>
</template>

<script setup lang="ts">
import type { UserProfile } from '@nimoura/shared-types';
import type { UserStatsResponse } from '~/composables/useAdminUsers';
import { formatDate, toPersianDigits } from '@nimoura/utils';

defineProps<{
  user: UserProfile;
  stats: UserStatsResponse | null;
}>();

const emit = defineEmits<{ delete: [] }>();

const { getDisplayName, getInitials, getRoleLabel, getRoleBadgeClass } =
  useAdminUsers();
</script>
