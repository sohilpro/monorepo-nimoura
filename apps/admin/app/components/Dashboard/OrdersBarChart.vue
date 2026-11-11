<template>
  <figure class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
    <header class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-gray-900">تعداد سفارش‌های روزانه</h2>
        <p class="mt-0.5 text-xs text-gray-500">
          میانگین:
          <span class="font-semibold text-gray-800">{{ toPersianDigits(avgOrders) }} سفارش</span>
          در هر بازه
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        @click="tableMode = !tableMode"
      >
        <i :class="tableMode ? 'pi pi-chart-bar' : 'pi pi-table'" class="text-[11px]" />
        {{ tableMode ? 'نمای نمودار' : 'نمای جدول' }}
      </button>
    </header>

    <div v-if="!points.length" class="flex h-60 items-center justify-center text-xs text-gray-400">
      سفارشی در این بازه ثبت نشده است.
    </div>

    <div v-else-if="tableMode" class="max-h-72 overflow-y-auto rounded-xl border border-gray-100">
      <table class="w-full text-start text-xs">
        <thead class="sticky top-0 bg-gray-50 text-gray-600">
          <tr>
            <th class="px-3 py-2 text-start font-semibold">تاریخ / ساعت</th>
            <th class="px-3 py-2 text-start font-semibold">تعداد سفارش</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 tabular-nums">
          <tr v-for="row in points" :key="row.date" class="hover:bg-gray-50">
            <td class="px-3 py-2 text-gray-700">{{ formatBucketLabel(row.date, range).full }}</td>
            <td class="px-3 py-2 font-semibold text-gray-900">{{ toPersianDigits(row.orders) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="relative" dir="ltr">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="h-64 w-full select-none overflow-visible"
        role="img"
        aria-label="نمودار تعداد سفارش‌ها"
        @mouseleave="hoverIndex = null"
      >
        <g v-for="tick in yTicks" :key="tick.y">
          <line
            :x1="PAD_L"
            :x2="W - PAD_R"
            :y1="tick.y"
            :y2="tick.y"
            stroke="var(--viz-grid)"
            stroke-width="1"
          />
          <text
            :x="PAD_L - 8"
            :y="tick.y + 4"
            text-anchor="end"
            class="fill-[var(--viz-text-muted)] text-[10px]"
          >
            {{ toPersianDigits(tick.value) }}
          </text>
        </g>

        <line
          :x1="PAD_L"
          :x2="W - PAD_R"
          :y1="PLOT_BOTTOM"
          :y2="PLOT_BOTTOM"
          stroke="var(--viz-axis)"
          stroke-width="1"
        />

        <!-- Thin bars <= 24px wide, 4px rounded top corners, square baseline -->
        <g v-for="(bar, idx) in bars" :key="`bar-${idx}`">
          <path
            :d="bar.path"
            fill="var(--viz-series-secondary)"
            :fill-opacity="hoverIndex === null || hoverIndex === idx ? 0.92 : 0.45"
            class="transition-opacity duration-150"
          />
          <text
            v-if="idx === peakIndex && bar.orders > 0"
            :x="bar.cx"
            :y="Math.max(bar.y - 6, 12)"
            text-anchor="middle"
            class="fill-[var(--viz-text-primary)] text-[10px] font-semibold"
          >
            {{ toPersianDigits(bar.orders) }}
          </text>
          <rect
            :x="bar.hitX"
            :y="PAD_T"
            :width="bar.hitW"
            :height="PLOT_H"
            fill="transparent"
            tabindex="0"
            class="cursor-pointer outline-none"
            :aria-label="`${formatBucketLabel(points[idx]!.date, range).full}: ${toPersianDigits(bar.orders)} سفارش`"
            @mouseenter="hoverIndex = idx"
            @focus="hoverIndex = idx"
          />
        </g>

        <text
          v-for="lbl in xLabels"
          :key="lbl.idx"
          :x="lbl.x"
          :y="H - 4"
          text-anchor="middle"
          class="fill-[var(--viz-text-muted)] text-[10px]"
        >
          {{ lbl.text }}
        </text>
      </svg>

      <div
        v-if="activeBar"
        dir="rtl"
        class="pointer-events-none absolute top-1 z-10 min-w-36 rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-xs"
        :style="tooltipStyle"
      >
        <p class="font-medium text-gray-500">
          {{ formatBucketLabel(activeBar.date, range).full }}
        </p>
        <p class="mt-1 font-bold text-gray-900">
          {{ toPersianDigits(activeBar.orders) }} سفارش
        </p>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { DashboardDailyPoint, DashboardRange } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';
import { formatBucketLabel } from '~/composables/useAdminDashboard';

const props = defineProps<{
  points: DashboardDailyPoint[];
  range: DashboardRange;
}>();

const tableMode = ref(false);
const hoverIndex = ref<number | null>(null);

const W = 520;
const H = 228;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 22;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const PLOT_BOTTOM = H - PAD_B;

const avgOrders = computed(() => {
  if (!props.points.length) return 0;
  const sum = props.points.reduce((acc, p) => acc + p.orders, 0);
  return Math.round((sum / props.points.length) * 10) / 10;
});

const maxOrders = computed(() => {
  const max = Math.max(...props.points.map((p) => p.orders), 0);
  return max > 0 ? Math.ceil(max * 1.15) : 4;
});

const yTicks = computed(() => {
  const steps = 4;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const ratio = i / steps;
    return {
      value: Math.round(maxOrders.value * ratio),
      y: PLOT_BOTTOM - ratio * PLOT_H,
    };
  });
});

function roundedTopRectPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return '';
  const radius = Math.min(r, w / 2, h);
  const bottom = y + h;
  return `M ${x} ${bottom} L ${x} ${y + radius} Q ${x} ${y} ${x + radius} ${y} L ${x + w - radius} ${y} Q ${x + w} ${y} ${x + w} ${y + radius} L ${x + w} ${bottom} Z`;
}

const bars = computed(() => {
  const n = props.points.length;
  if (!n) return [];
  const slotW = PLOT_W / n;
  const barW = Math.min(22, Math.max(4, slotW * 0.58));
  return props.points.map((p, i) => {
    const cx = PAD_L + (i + 0.5) * slotW;
    const h = (p.orders / maxOrders.value) * PLOT_H;
    const y = PLOT_BOTTOM - h;
    const x = cx - barW / 2;
    return {
      cx,
      y,
      orders: p.orders,
      date: p.date,
      hitX: PAD_L + i * slotW,
      hitW: Math.max(slotW, 12),
      path: roundedTopRectPath(x, y, barW, h, 4),
    };
  });
});

const peakIndex = computed(() => {
  let idx = 0;
  props.points.forEach((p, i) => {
    if (p.orders >= (props.points[idx]?.orders ?? 0)) idx = i;
  });
  return idx;
});

const xLabels = computed(() => {
  const n = bars.value.length;
  if (!n) return [];
  const maxTicks = Math.min(n, 6);
  const step = Math.max(1, Math.ceil((n - 1) / (maxTicks - 1 || 1)));
  const out: Array<{ idx: number; x: number; text: string }> = [];
  for (let i = 0; i < n; i += step) {
    out.push({
      idx: i,
      x: bars.value[i]!.cx,
      text: formatBucketLabel(props.points[i]!.date, props.range).short,
    });
  }
  return out;
});

const activeBar = computed(() =>
  hoverIndex.value !== null ? bars.value[hoverIndex.value] ?? null : null,
);

const tooltipStyle = computed(() => {
  if (!activeBar.value) return {};
  const pct = (activeBar.value.cx / W) * 100;
  return pct > 60
    ? { right: `${100 - pct + 2}%` }
    : { left: `${pct + 2}%` };
});
</script>
