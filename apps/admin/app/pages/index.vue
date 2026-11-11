<template>
  <section class="dashboard-viz-root space-y-6">
    <!-- Top Header + Global Time-Range Filter Row -->
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-medium text-brand-600">{{ todayPersianDate }}</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          داشبورد مدیریت نیمورا
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          نمای یکپارچه فروش، سفارش‌ها، سلامت انبار، مشتریان و محتوای فروشگاه
        </p>
      </div>

      <!-- Single Global Filter Bar (above all charts & KPIs) -->
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1 shadow-theme-xs"
          role="group"
          aria-label="فیلتر بازه زمانی داشبورد"
        >
          <button
            v-for="opt in DASHBOARD_RANGE_OPTIONS"
            :key="opt.value"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
            :class="
              range === opt.value
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            "
            @click="load(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <button
          type="button"
          class="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50"
          :disabled="refetching"
          aria-label="بروزرسانی آمار"
          @click="load(range)"
        >
          <i class="pi pi-refresh text-xs" :class="{ 'animate-spin': refetching }" />
          بروزرسانی
        </button>
      </div>
    </header>

    <!-- Initial Loading State -->
    <div v-if="initialLoading && !dashboard" class="space-y-6">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div class="h-52 animate-pulse rounded-2xl bg-gray-100 xl:col-span-5" />
        <div class="grid grid-cols-2 gap-4 xl:col-span-7">
          <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="h-80 animate-pulse rounded-2xl bg-gray-100 lg:col-span-7" />
        <div class="h-80 animate-pulse rounded-2xl bg-gray-100 lg:col-span-5" />
      </div>
    </div>

    <!-- Error Empty State -->
    <div
      v-else-if="errorMessage && !dashboard"
      class="rounded-2xl border border-error-200 bg-error-50/60 p-8 text-center"
    >
      <i class="pi pi-exclamation-circle text-3xl text-error-600" />
      <p class="mt-3 text-sm font-semibold text-gray-800">{{ errorMessage }}</p>
      <button
        type="button"
        class="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600"
        @click="load(range)"
      >
        تلاش مجدد
      </button>
    </div>

    <!-- Dashboard Content (refetch holds frame at reduced opacity) -->
    <div
      v-else-if="dashboard"
      class="space-y-6 transition-opacity duration-200"
      :class="{ 'pointer-events-none opacity-60': refetching }"
    >
      <DashboardKpiOverview
        :kpis="dashboard.kpis"
        :series="dashboard.dailySeries"
        :range="dashboard.range"
      />

      <!-- Two separate single-axis time-series charts (no dual-axis) -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <DashboardRevenueTrendChart
            :points="dashboard.dailySeries"
            :range="dashboard.range"
          />
        </div>
        <div class="lg:col-span-5">
          <DashboardOrdersBarChart
            :points="dashboard.dailySeries"
            :range="dashboard.range"
          />
        </div>
      </div>

      <!-- Order Status Breakdown + Top Products / Categories -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <DashboardOrderStatusBreakdown :statuses="dashboard.orderStatuses" />
        </div>
        <div class="lg:col-span-6">
          <DashboardTopPerformanceCard
            :products="dashboard.topProducts"
            :categories="dashboard.topCategories"
          />
        </div>
      </div>

      <!-- Payment Channels + Inventory Health -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <DashboardPaymentChannelsCard
            :payment-methods="dashboard.paymentMethods"
            :torob-orders-count="dashboard.kpis.orders.torobOrdersCount"
            :engagement="dashboard.kpis.engagement"
          />
        </div>
        <div class="lg:col-span-7">
          <DashboardInventoryHealthCard
            :catalog="dashboard.kpis.catalog"
            :low-stock-products="dashboard.lowStockProducts"
          />
        </div>
      </div>

      <!-- Recent Orders & Quick Action Queue -->
      <DashboardActionCenter
        :recent-orders="dashboard.recentOrders"
        :kpis="dashboard.kpis"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { DASHBOARD_RANGE_OPTIONS } from '~/composables/useAdminDashboard';

const { dashboard, range, initialLoading, refetching, errorMessage, load } =
  useAdminDashboard();

const todayPersianDate = computed(() =>
  new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date()),
);

onMounted(() => {
  load('30d');
});
</script>

<style scoped>
/* Documented Nimoura chart palette & chrome roles (all components read these CSS vars) */
.dashboard-viz-root {
  --viz-surface: #ffffff;
  --viz-grid: #ebe0df;
  --viz-axis: #d8c8c3;
  --viz-text-primary: #272121;
  --viz-text-secondary: #665d5d;
  --viz-text-muted: #9b9191;

  --viz-series-primary: #a15661;
  --viz-series-secondary: #0086c9;

  --viz-status-delivered: #059669;
  --viz-status-shipped: #a15661;
  --viz-status-processing: #0086c9;
  --viz-status-pending: #eb6834;
  --viz-status-paid: #1baf7a;
  --viz-status-cancelled: #d92d20;
}
</style>
