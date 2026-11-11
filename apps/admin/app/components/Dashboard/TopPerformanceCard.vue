<template>
  <figure class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
    <header class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-base font-bold text-gray-900">عملکرد فروش</h2>
        <p class="mt-0.5 text-xs text-gray-500">بر اساس درآمد سفارش‌های پرداخت‌شده</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs">
          <button
            type="button"
            class="rounded-lg px-2.5 py-1 font-medium transition"
            :class="tab === 'products' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
            @click="tab = 'products'"
          >
            محصولات
          </button>
          <button
            type="button"
            class="rounded-lg px-2.5 py-1 font-medium transition"
            :class="tab === 'categories' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
            @click="tab = 'categories'"
          >
            دسته‌بندی‌ها
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          @click="tableMode = !tableMode"
        >
          <i :class="tableMode ? 'pi pi-chart-bar' : 'pi pi-table'" class="text-[11px]" />
          {{ tableMode ? 'نمودار' : 'جدول' }}
        </button>
      </div>
    </header>

    <div v-if="!rows.length" class="rounded-xl bg-gray-50 py-10 text-center text-xs text-gray-400">
      فروشی در این بازه ثبت نشده است.
    </div>

    <div v-else-if="tableMode" class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="w-full text-start text-xs">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-3 py-2 text-start font-semibold">عنوان</th>
            <th class="px-3 py-2 text-start font-semibold">تعداد فروش</th>
            <th class="px-3 py-2 text-start font-semibold">درآمد (تومان)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 tabular-nums">
          <tr v-for="row in rows" :key="row.id" class="hover:bg-brand-50/30">
            <td class="max-w-52 truncate px-3 py-2 font-medium text-gray-800">{{ row.label }}</td>
            <td class="px-3 py-2 text-gray-700">{{ toPersianDigits(row.unitsSold) }}</td>
            <td class="px-3 py-2 font-semibold text-gray-900">{{ numberFormat(row.revenue) || '۰' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="row in rows"
        :key="row.id"
        class="group rounded-xl p-1.5 transition hover:bg-gray-50/70"
        @mouseenter="hoveredId = row.id"
        @mouseleave="hoveredId = null"
      >
        <div class="mb-1.5 flex items-center justify-between gap-2 text-xs">
          <NuxtLink
            v-if="tab === 'products'"
            :to="`/product/${row.id}`"
            class="truncate font-medium text-gray-800 hover:text-brand-600"
          >
            {{ row.label }}
          </NuxtLink>
          <span v-else class="truncate font-medium text-gray-800">{{ row.label }}</span>

          <span class="shrink-0 tabular-nums text-gray-600">
            <b class="font-semibold text-gray-900">{{ formatCompactToman(row.revenue) }}</b>
            تومان
            <span class="text-gray-400">({{ toPersianDigits(row.unitsSold) }} عدد)</span>
          </span>
        </div>

        <!-- Ranked Horizontal Bar (single hue, 12px height <= 24px, 4px rounded data-end) -->
        <div class="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            class="h-full rounded-e-[4px] transition-all duration-300"
            :style="{
              width: `${row.pct}%`,
              backgroundColor: 'var(--viz-series-primary)',
              opacity: hoveredId && hoveredId !== row.id ? 0.5 : 1,
            }"
          />
        </div>
      </li>
    </ul>
  </figure>
</template>

<script setup lang="ts">
import type { DashboardTopCategory, DashboardTopProduct } from '@nimoura/shared-types';
import { numberFormat, toPersianDigits } from '@nimoura/utils';
import { formatCompactToman } from '~/composables/useAdminDashboard';

const props = defineProps<{
  products: DashboardTopProduct[];
  categories: DashboardTopCategory[];
}>();

const tab = ref<'products' | 'categories'>('products');
const tableMode = ref(false);
const hoveredId = ref<number | null>(null);

const rows = computed(() => {
  const list =
    tab.value === 'products'
      ? props.products.map((p) => ({
          id: p.id,
          label: p.title,
          revenue: p.revenue,
          unitsSold: p.unitsSold,
        }))
      : props.categories.map((c) => ({
          id: c.id,
          label: c.name,
          revenue: c.revenue,
          unitsSold: c.unitsSold,
        }));

  const maxRev = Math.max(...list.map((r) => r.revenue), 1);
  return list.map((r) => ({
    ...r,
    pct: r.revenue > 0 ? Math.max(4, Math.round((r.revenue / maxRev) * 100)) : 0,
  }));
});
</script>
