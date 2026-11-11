<template>
  <figure class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
    <header class="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 class="text-base font-bold text-gray-900">توزیع وضعیت سفارش‌ها</h2>
        <p class="mt-0.5 text-xs text-gray-500">
          مجموع {{ toPersianDigits(totalCount) }} سفارش در بازه انتخابی
        </p>
      </div>
      <NuxtLink to="/order" class="text-xs font-medium text-brand-600 hover:underline">
        مدیریت سفارش‌ها
      </NuxtLink>
    </header>

    <div v-if="!totalCount" class="rounded-xl bg-gray-50 py-10 text-center text-xs text-gray-400">
      سفارشی در این بازه ثبت نشده است.
    </div>

    <template v-else>
      <!-- Tall segmented bar (28px height, 2px surface gap, 4px radius) -->
      <div
        class="relative flex h-7 w-full items-stretch gap-0.5"
        role="img"
        aria-label="نوار بخش‌بندی وضعیت سفارش‌ها"
      >
        <button
          v-for="seg in activeSegments"
          :key="seg.status"
          type="button"
          class="relative flex h-full items-center justify-center rounded-[4px] transition-opacity focus:outline-hidden"
          :style="{
            width: `${seg.share}%`,
            backgroundColor: ORDER_STATUS_META[seg.status].colorVar,
          }"
          :class="hoveredStatus && hoveredStatus !== seg.status ? 'opacity-55' : 'opacity-100'"
          :aria-label="`${ORDER_STATUS_META[seg.status].label}: ${toPersianDigits(seg.count)} سفارش (${toPersianDigits(seg.share)} درصد)`"
          @mouseenter="hoveredStatus = seg.status"
          @mouseleave="hoveredStatus = null"
          @focus="hoveredStatus = seg.status"
          @blur="hoveredStatus = null"
        >
          <span
            v-if="seg.share >= 11"
            class="px-1 text-[11px] font-semibold text-white"
          >
            {{ toPersianDigits(Math.round(seg.share)) }}٪
          </span>
        </button>
      </div>

      <!-- Hover readout line -->
      <div class="mt-2 min-h-5 text-xs text-gray-600">
        <template v-if="hoveredSegment">
          <span class="font-semibold text-gray-900">
            {{ ORDER_STATUS_META[hoveredSegment.status].label }}:
          </span>
          {{ toPersianDigits(hoveredSegment.count) }} سفارش
          ({{ numberFormat(hoveredSegment.totalAmount) || '۰' }} تومان)
        </template>
      </div>

      <!-- Legend & figures list -->
      <ul class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <li
          v-for="item in statuses"
          :key="item.status"
          class="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs transition hover:border-gray-200 hover:bg-gray-50/70"
          @mouseenter="hoveredStatus = item.status"
          @mouseleave="hoveredStatus = null"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="size-2.5 shrink-0 rounded-xs"
              :style="{ backgroundColor: ORDER_STATUS_META[item.status].colorVar }"
            />
            <i :class="[ORDER_STATUS_META[item.status].icon, 'text-[11px] text-gray-500']" />
            <span class="truncate font-medium text-gray-700">
              {{ ORDER_STATUS_META[item.status].label }}
            </span>
          </div>
          <div class="flex shrink-0 items-center gap-2 tabular-nums">
            <span class="font-bold text-gray-900">{{ toPersianDigits(item.count) }}</span>
            <span class="text-[11px] text-gray-400">({{ toPersianDigits(item.share) }}٪)</span>
          </div>
        </li>
      </ul>
    </template>
  </figure>
</template>

<script setup lang="ts">
import type { DashboardStatusItem, OrderStatus } from '@nimoura/shared-types';
import { numberFormat, toPersianDigits } from '@nimoura/utils';
import { ORDER_STATUS_META } from '~/composables/useAdminDashboard';

const props = defineProps<{
  statuses: DashboardStatusItem[];
}>();

const hoveredStatus = ref<OrderStatus | null>(null);

const totalCount = computed(() =>
  props.statuses.reduce((sum, s) => sum + s.count, 0),
);

const activeSegments = computed(() =>
  props.statuses.filter((s) => s.count > 0),
);

const hoveredSegment = computed(() =>
  hoveredStatus.value
    ? props.statuses.find((s) => s.status === hoveredStatus.value) ?? null
    : null,
);
</script>
