<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-12">
    <!-- Recent Orders Table -->
    <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs xl:col-span-8">
      <header class="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 class="text-base font-bold text-gray-900">آخرین سفارش‌های ثبت‌شده</h2>
          <p class="mt-0.5 text-xs text-gray-500">نمای سریع تازه‌ترین سفارش‌های فروشگاه</p>
        </div>
        <NuxtLink to="/order" class="text-xs font-medium text-brand-600 hover:underline">
          مشاهده همه
        </NuxtLink>
      </header>

      <div v-if="!recentOrders.length" class="rounded-xl bg-gray-50 py-10 text-center text-xs text-gray-400">
        هنوز سفارشی ثبت نشده است.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[600px] text-start text-xs">
          <thead class="border-b border-gray-100 text-gray-500">
            <tr>
              <th class="pb-2.5 text-start font-semibold">کد سفارش</th>
              <th class="pb-2.5 text-start font-semibold">مشتری</th>
              <th class="pb-2.5 text-start font-semibold">وضعیت</th>
              <th class="pb-2.5 text-start font-semibold">مبلغ نهایی</th>
              <th class="pb-2.5 text-end font-semibold">تاریخ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-brand-50/30">
              <td class="py-3">
                <NuxtLink
                  :to="`/order/${order.id}`"
                  class="font-semibold text-brand-700 hover:underline"
                  dir="ltr"
                >
                  {{ order.orderCode }}
                </NuxtLink>
                <span class="mt-0.5 block text-[11px] text-gray-400">
                  {{ toPersianDigits(order.itemsCount) }} قلم کالا
                </span>
              </td>
              <td class="py-3">
                <p class="font-medium text-gray-800">{{ order.customerName }}</p>
                <p class="text-[11px] tabular-nums text-gray-400" dir="ltr">{{ order.phone }}</p>
              </td>
              <td class="py-3">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                  :class="getStatusBadgeClass(order.status)"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="py-3 font-semibold tabular-nums text-gray-900">
                {{ numberFormat(order.finalTotal) || '۰' }} تومان
              </td>
              <td class="py-3 text-end tabular-nums text-gray-500">
                {{ formatDate(order.createdAt) || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Moderation & Operations Queue -->
    <section class="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs xl:col-span-4">
      <div>
        <header class="mb-4">
          <h2 class="text-base font-bold text-gray-900">صف بررسی و مدیریت سریع</h2>
          <p class="mt-0.5 text-xs text-gray-500">موارد نیازمند اقدام ادمین</p>
        </header>

        <ul class="space-y-2.5">
          <li v-for="task in actionItems" :key="task.to">
            <NuxtLink
              :to="task.to"
              class="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-lg" :class="task.iconClass">
                  <i :class="[task.icon, 'text-sm']" />
                </span>
                <div class="min-w-0">
                  <p class="truncate text-xs font-semibold text-gray-800">{{ task.title }}</p>
                  <p class="truncate text-[11px] text-gray-500">{{ task.subtitle }}</p>
                </div>
              </div>
              <span
                class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums"
                :class="task.count > 0 ? task.badgeClass : 'bg-gray-100 text-gray-500'"
              >
                {{ toPersianDigits(task.count) }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 text-xs">
        <NuxtLink
          to="/product/create"
          class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 font-medium text-white transition hover:bg-brand-600"
        >
          <i class="pi pi-plus text-[11px]" />
          محصول جدید
        </NuxtLink>
        <NuxtLink
          to="/customers/create"
          class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <i class="pi pi-user-plus text-[11px]" />
          مشتری جدید
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { DashboardRecentOrder, DashboardResponse } from '@nimoura/shared-types';
import { formatDate, numberFormat, toPersianDigits } from '@nimoura/utils';

const props = defineProps<{
  recentOrders: DashboardRecentOrder[];
  kpis: DashboardResponse['kpis'];
}>();

const { getStatusLabel, getStatusBadgeClass } = useAdminOrders();

const actionItems = computed(() => [
  {
    to: '/order/no-sending',
    title: 'سفارش‌های ارسال‌نشده',
    subtitle: 'سفارش‌های پرداخت‌شده منتظر ارسال',
    count: props.kpis.orders.awaitingDispatchCount,
    icon: 'pi pi-truck',
    iconClass: 'bg-warning-50 text-warning-600',
    badgeClass: 'bg-warning-100 text-warning-800',
  },
  {
    to: '/comments',
    title: 'دیدگاه‌های محصول',
    subtitle: `از مجموع ${toPersianDigits(props.kpis.engagement.totalProductComments)} دیدگاه`,
    count: props.kpis.engagement.pendingProductComments,
    icon: 'pi pi-comment',
    iconClass: 'bg-brand-50 text-brand-600',
    badgeClass: 'bg-brand-100 text-brand-700',
  },
  {
    to: '/magazine/comments',
    title: 'نظرات مجله زیبایی',
    subtitle: `${toPersianDigits(props.kpis.engagement.totalArticleViews)} بازدید کل مقالات`,
    count: props.kpis.engagement.pendingMagazineComments,
    icon: 'pi pi-book',
    iconClass: 'bg-nimoura-accent/45 text-nimoura-velvet',
    badgeClass: 'bg-nimoura-accent text-nimoura-velvet',
  },
  {
    to: '/banners',
    title: 'بنرهای فعال سایت',
    subtitle: `${toPersianDigits(props.kpis.engagement.totalBannerViews)} نمایش · ${toPersianDigits(props.kpis.engagement.totalBannerClicks)} کلیک`,
    count: props.kpis.engagement.activeBanners,
    icon: 'pi pi-images',
    iconClass: 'bg-blue-light-50 text-blue-light-600',
    badgeClass: 'bg-blue-light-100 text-blue-light-700',
  },
]);
</script>
