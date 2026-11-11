<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-12">
    <!-- Hero Revenue Card -->
    <section
      class="flex flex-col justify-between rounded-2xl border border-brand-200/80 bg-gradient-to-bl from-brand-50/90 via-white to-white p-5 shadow-theme-xs xl:col-span-5"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-100/80 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            <i class="pi pi-chart-line text-[11px]" />
            درآمد تاییدشده {{ rangeLabel }}
          </span>
          <div class="mt-3 flex flex-wrap items-baseline gap-2">
            <p class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {{ numberFormat(kpis.revenue.current) || '۰' }}
            </p>
            <span class="text-sm font-medium text-gray-500">تومان</span>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              v-if="kpis.revenue.deltaPercent !== null"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
              :class="deltaClass(kpis.revenue.deltaPercent)"
            >
              <i
                class="pi text-[10px]"
                :class="kpis.revenue.deltaPercent >= 0 ? 'pi-arrow-up-left' : 'pi-arrow-down-left'"
              />
              {{ toPersianDigits(Math.abs(kpis.revenue.deltaPercent)) }}٪ نسبت به دوره قبل
            </span>
            <span class="text-gray-500">
              میانگین سبد:
              <b class="font-semibold text-gray-800">{{ formatCompactToman(kpis.revenue.averageOrderValue) }} تومان</b>
            </span>
          </div>
        </div>

        <NuxtLink
          to="/order"
          class="shrink-0 rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
        >
          سفارش‌ها
        </NuxtLink>
      </div>

      <!-- Mini Sparkline (last points of selected range) -->
      <div class="mt-4 border-t border-brand-100/80 pt-3">
        <div class="mb-1 flex items-center justify-between text-[11px] text-gray-500">
          <span>روند بازه</span>
          <span>کل فروش تاریخچه: {{ formatCompactToman(kpis.revenue.allTime) }} تومان</span>
        </div>
        <svg
          v-if="sparkPoints.length > 1"
          viewBox="0 0 280 52"
          class="h-13 w-full overflow-visible"
          role="img"
          aria-label="نمودار کوچک روند درآمد"
        >
          <path :d="sparkAreaPath" fill="var(--viz-series-primary)" fill-opacity="0.10" />
          <path
            :d="sparkLinePath"
            fill="none"
            stroke="var(--viz-series-primary)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-if="lastSparkPoint"
            :cx="lastSparkPoint.x"
            :cy="lastSparkPoint.y"
            r="4.5"
            fill="var(--viz-series-primary)"
            stroke="var(--viz-surface)"
            stroke-width="2"
          />
        </svg>
      </div>
    </section>

    <!-- 4 Operational KPI Tiles -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-7">
      <!-- Orders Tile -->
      <NuxtLink
        to="/order"
        class="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs font-medium text-gray-500">سفارش‌های {{ rangeLabel }}</p>
            <p class="mt-1.5 text-2xl font-bold text-gray-900">
              {{ numberFormat(kpis.orders.current) || '۰' }}
            </p>
          </div>
          <span class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:scale-105">
            <i class="pi pi-shopping-bag text-base" />
          </span>
        </div>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
          <span class="text-warning-700 font-medium">
            {{ toPersianDigits(kpis.orders.awaitingDispatchCount) }} آماده ارسال
          </span>
          <span
            v-if="kpis.orders.deltaPercent !== null"
            class="rounded-full px-2 py-0.5 font-semibold"
            :class="deltaClass(kpis.orders.deltaPercent)"
          >
            {{ kpis.orders.deltaPercent >= 0 ? '+' : '-' }}{{ toPersianDigits(Math.abs(kpis.orders.deltaPercent)) }}٪
          </span>
          <span v-else class="text-gray-400">
            کل: {{ toPersianDigits(kpis.orders.totalAllTime) }}
          </span>
        </div>
      </NuxtLink>

      <!-- Customers Tile -->
      <NuxtLink
        to="/customers"
        class="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs font-medium text-gray-500">مشتریان و کاربران</p>
            <p class="mt-1.5 text-2xl font-bold text-gray-900">
              {{ numberFormat(kpis.customers.total) || '۰' }}
            </p>
          </div>
          <span class="flex size-10 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-600 transition group-hover:scale-105">
            <i class="pi pi-users text-base" />
          </span>
        </div>
        <div class="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
          <span class="font-medium text-success-700">
            +{{ toPersianDigits(kpis.customers.newInRange) }} عضو جدید
          </span>
          <span class="text-gray-500">
            {{ toPersianDigits(kpis.customers.verifiedMobile) }} موبایل تأییدشده
          </span>
        </div>
      </NuxtLink>

      <!-- Catalog & Stock Tile -->
      <NuxtLink
        to="/product"
        class="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs font-medium text-gray-500">محصولات فعال کاتالوگ</p>
            <p class="mt-1.5 text-2xl font-bold text-gray-900">
              {{ numberFormat(kpis.catalog.activeProducts) || '۰' }}
              <span class="text-xs font-normal text-gray-400">از {{ toPersianDigits(kpis.catalog.totalProducts) }}</span>
            </p>
          </div>
          <span class="flex size-10 items-center justify-center rounded-xl bg-success-50 text-success-600 transition group-hover:scale-105">
            <i class="pi pi-box text-base" />
          </span>
        </div>
        <div class="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
          <span :class="kpis.catalog.lowStock > 0 ? 'font-medium text-warning-700' : 'text-gray-500'">
            {{ toPersianDigits(kpis.catalog.lowStock) }} کم‌موجودی
          </span>
          <span :class="kpis.catalog.outOfStock > 0 ? 'font-medium text-error-600' : 'text-gray-500'">
            {{ toPersianDigits(kpis.catalog.outOfStock) }} ناموجود
          </span>
        </div>
      </NuxtLink>

      <!-- Engagement & Marketing Tile -->
      <NuxtLink
        to="/comments"
        class="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs font-medium text-gray-500">دیدگاه منتظر تأیید</p>
            <p class="mt-1.5 text-2xl font-bold text-gray-900">
              {{ numberFormat(pendingCommentsTotal) || '۰' }}
            </p>
          </div>
          <span class="flex size-10 items-center justify-center rounded-xl bg-nimoura-accent/45 text-nimoura-velvet transition group-hover:scale-105">
            <i class="pi pi-comments text-base" />
          </span>
        </div>
        <div class="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
          <span class="text-gray-600">
            {{ toPersianDigits(kpis.engagement.activePromotions) }} کد تخفیف فعال
          </span>
          <span class="text-gray-500">
            {{ toPersianDigits(kpis.engagement.publishedArticles) }} مقاله مجله
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardDailyPoint, DashboardRange, DashboardResponse } from '@nimoura/shared-types';
import { numberFormat, toPersianDigits } from '@nimoura/utils';
import { DASHBOARD_RANGE_OPTIONS, formatCompactToman } from '~/composables/useAdminDashboard';

const props = defineProps<{
  kpis: DashboardResponse['kpis'];
  series: DashboardDailyPoint[];
  range: DashboardRange;
}>();

const rangeLabel = computed(
  () => DASHBOARD_RANGE_OPTIONS.find((r) => r.value === props.range)?.label ?? '',
);

const pendingCommentsTotal = computed(
  () =>
    props.kpis.engagement.pendingProductComments +
    props.kpis.engagement.pendingMagazineComments,
);

function deltaClass(delta: number) {
  return delta >= 0
    ? 'bg-success-50 text-success-700'
    : 'bg-error-50 text-error-700';
}

const sparkSlice = computed(() => props.series.slice(-14));

const sparkPoints = computed(() => {
  const list = sparkSlice.value;
  if (!list.length) return [];
  const maxVal = Math.max(...list.map((p) => p.revenue), 1);
  const w = 280;
  const h = 44;
  const padY = 4;
  return list.map((p, idx) => ({
    x: list.length === 1 ? w / 2 : (idx / (list.length - 1)) * w,
    y: padY + (1 - p.revenue / maxVal) * (h - padY * 2),
  }));
});

const sparkLinePath = computed(() =>
  sparkPoints.value
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' '),
);

const sparkAreaPath = computed(() => {
  const pts = sparkPoints.value;
  if (pts.length < 2) return '';
  return `${sparkLinePath.value} L ${pts[pts.length - 1]!.x.toFixed(1)} 48 L ${pts[0]!.x.toFixed(1)} 48 Z`;
});

const lastSparkPoint = computed(
  () => sparkPoints.value[sparkPoints.value.length - 1] ?? null,
);
</script>
