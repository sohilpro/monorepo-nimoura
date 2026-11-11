<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
    <header class="mb-4 flex items-center justify-between gap-2">
      <div>
        <h2 class="text-base font-bold text-gray-900">سلامت انبار و هشدار موجودی</h2>
        <p class="mt-0.5 text-xs text-gray-500">
          {{ toPersianDigits(catalog.categoriesCount) }} دسته‌بندی ·
          {{ toPersianDigits(catalog.brandsCount) }} برند ·
          {{ toPersianDigits(catalog.tagsCount) }} تگ فعال
        </p>
      </div>
      <NuxtLink to="/product" class="text-xs font-medium text-brand-600 hover:underline">
        کاتالوگ محصولات
      </NuxtLink>
    </header>

    <!-- Same-ramp Meter List for Stock Health -->
    <div class="grid grid-cols-3 gap-2.5">
      <div class="rounded-xl border border-success-100 bg-success-50/50 p-3">
        <div class="flex items-center justify-between text-[11px] font-medium text-success-700">
          <span>موجود سالم</span>
          <i class="pi pi-check-circle text-xs" />
        </div>
        <p class="mt-1 text-xl font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(catalog.inStock) }}
        </p>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-success-100">
          <div class="h-full rounded-full bg-success-600" :style="{ width: `${pct(catalog.inStock)}%` }" />
        </div>
      </div>

      <div class="rounded-xl border border-warning-100 bg-warning-25 p-3">
        <div class="flex items-center justify-between text-[11px] font-medium text-warning-700">
          <span>کم‌موجودی</span>
          <i class="pi pi-exclamation-triangle text-xs" />
        </div>
        <p class="mt-1 text-xl font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(catalog.lowStock) }}
        </p>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
          <div class="h-full rounded-full bg-orange-500" :style="{ width: `${pct(catalog.lowStock)}%` }" />
        </div>
      </div>

      <div class="rounded-xl border border-error-100 bg-error-50/50 p-3">
        <div class="flex items-center justify-between text-[11px] font-medium text-error-700">
          <span>ناموجود</span>
          <i class="pi pi-times-circle text-xs" />
        </div>
        <p class="mt-1 text-xl font-bold tabular-nums text-gray-900">
          {{ toPersianDigits(catalog.outOfStock) }}
        </p>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-error-100">
          <div class="h-full rounded-full bg-error-600" :style="{ width: `${pct(catalog.outOfStock)}%` }" />
        </div>
      </div>
    </div>

    <!-- Actionable Low Stock Products List -->
    <div class="mt-4 border-t border-gray-100 pt-4">
      <p class="mb-2.5 text-xs font-semibold text-gray-700">کالاهای نیازمند بررسی موجودی</p>
      <div
        v-if="!lowStockProducts.length"
        class="rounded-xl bg-success-50/40 px-4 py-5 text-center text-xs text-success-700"
      >
        همه‌ی کالاهای فعال موجودی کافی دارند.
      </div>
      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="item in lowStockProducts"
          :key="item.id"
          class="flex items-center justify-between gap-3 py-2.5"
        >
          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="`/product/${item.id}`"
              class="block truncate text-xs font-semibold text-gray-800 hover:text-brand-600"
            >
              {{ item.title }}
            </NuxtLink>
            <span class="text-[11px] text-gray-400" dir="ltr">{{ item.sku }}</span>
          </div>

          <span
            class="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
            :class="
              item.stock <= 0 || !item.isAvailable
                ? 'bg-error-50 text-error-700'
                : 'bg-orange-50 text-orange-700'
            "
          >
            {{
              !item.isAvailable
                ? 'غیرفعال'
                : item.stock <= 0
                  ? 'ناموجود'
                  : `${toPersianDigits(item.stock)} عدد`
            }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DashboardLowStockItem, DashboardResponse } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';

const props = defineProps<{
  catalog: DashboardResponse['kpis']['catalog'];
  lowStockProducts: DashboardLowStockItem[];
}>();

function pct(count: number): number {
  if (!props.catalog.totalProducts) return 0;
  return Math.round((count / props.catalog.totalProducts) * 100);
}
</script>
