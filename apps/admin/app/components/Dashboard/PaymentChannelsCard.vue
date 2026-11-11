<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
    <header class="mb-4 flex items-center justify-between gap-2">
      <div>
        <h2 class="text-base font-bold text-gray-900">درگاه‌های پرداخت و بازاریابی</h2>
        <p class="mt-0.5 text-xs text-gray-500">سهم درگاه‌ها در فروش تاییدشده و عملکرد کمپین‌ها</p>
      </div>
      <NuxtLink to="/promotion" class="text-xs font-medium text-brand-600 hover:underline">
        تخفیف‌ها
      </NuxtLink>
    </header>

    <!-- Same-ramp Meter List for Payment Methods -->
    <ul class="space-y-3">
      <li v-for="pm in paymentMethods" :key="pm.method" class="space-y-1.5">
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="font-medium text-gray-700">{{ paymentMethodLabel(pm.method) }}</span>
          <span class="tabular-nums text-gray-600">
            <b class="font-semibold text-gray-900">{{ formatCompactToman(pm.revenue) }}</b>
            تومان · {{ toPersianDigits(pm.count) }} تراکنش ({{ toPersianDigits(pm.share) }}٪)
          </span>
        </div>
        <div class="h-2.5 w-full overflow-hidden rounded-full bg-brand-50">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{
              width: `${pm.share}%`,
              backgroundColor: 'var(--viz-series-primary)',
            }"
          />
        </div>
      </li>
    </ul>

    <!-- Marketing & Content Pulse -->
    <div class="mt-5 grid grid-cols-2 gap-2.5 border-t border-gray-100 pt-4 sm:grid-cols-3">
      <div class="rounded-xl bg-gray-50 p-3">
        <p class="text-[11px] text-gray-500">سفارش‌های ترب</p>
        <p class="mt-1 text-base font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(torobOrdersCount) }}
        </p>
      </div>
      <div class="rounded-xl bg-gray-50 p-3">
        <p class="text-[11px] text-gray-500">استفاده از کد تخفیف</p>
        <p class="mt-1 text-base font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(engagement.totalPromoUsages) }}
        </p>
      </div>
      <div class="col-span-2 rounded-xl bg-gray-50 p-3 sm:col-span-1">
        <p class="text-[11px] text-gray-500">نرخ کلیک بنرها</p>
        <p class="mt-1 text-base font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(bannerCtr) }}٪
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DashboardPaymentMethodItem, DashboardResponse } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';
import { formatCompactToman, paymentMethodLabel } from '~/composables/useAdminDashboard';

const props = defineProps<{
  paymentMethods: DashboardPaymentMethodItem[];
  torobOrdersCount: number;
  engagement: DashboardResponse['kpis']['engagement'];
}>();

const bannerCtr = computed(() => {
  const views = props.engagement.totalBannerViews;
  if (!views) return 0;
  return Math.round((props.engagement.totalBannerClicks / views) * 1000) / 10;
});
</script>
