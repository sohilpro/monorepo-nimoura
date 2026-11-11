<template>
  <figure class="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
    <header class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-gray-900">روند درآمد روزانه (تومان)</h2>
        <p class="mt-0.5 text-xs text-gray-500">
          فروش تاییدشده بر حسب بازه زمانی انتخابی · اوج دوره:
          <span class="font-semibold text-gray-800">{{ formatCompactToman(peakPoint?.revenue ?? 0) }} تومان</span>
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        @click="tableMode = !tableMode"
      >
        <i :class="tableMode ? 'pi pi-chart-line' : 'pi pi-table'" class="text-[11px]" />
        {{ tableMode ? 'نمای نمودار' : 'نمای جدول' }}
      </button>
    </header>

    <div v-if="!points.length" class="flex h-60 items-center justify-center text-xs text-gray-400">
      داده‌ای برای این بازه ثبت نشده است.
    </div>

    <!-- Accessible Table Twin -->
    <div v-else-if="tableMode" class="max-h-72 overflow-y-auto rounded-xl border border-gray-100">
      <table class="w-full text-start text-xs">
        <thead class="sticky top-0 bg-gray-50 text-gray-600">
          <tr>
            <th class="px-3 py-2 text-start font-semibold">تاریخ / ساعت</th>
            <th class="px-3 py-2 text-start font-semibold">درآمد (تومان)</th>
            <th class="px-3 py-2 text-start font-semibold">تعداد سفارش</th>
            <th class="px-3 py-2 text-start font-semibold">کاربر جدید</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 tabular-nums">
          <tr v-for="row in points" :key="row.date" class="hover:bg-brand-50/30">
            <td class="px-3 py-2 text-gray-700">{{ formatBucketLabel(row.date, range).full }}</td>
            <td class="px-3 py-2 font-semibold text-gray-900">{{ numberFormat(row.revenue) || '۰' }}</td>
            <td class="px-3 py-2 text-gray-700">{{ toPersianDigits(row.orders) }}</td>
            <td class="px-3 py-2 text-gray-700">{{ toPersianDigits(row.newUsers) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Interactive SVG Chart -->
    <div v-else class="relative" dir="ltr">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="h-64 w-full select-none overflow-visible"
        role="img"
        aria-label="نمودار روند درآمد"
        @mouseleave="hoverIndex = null"
      >
        <!-- Y Gridlines (1px solid hairline) & Ticks -->
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
            {{ formatCompactToman(tick.value) }}
          </text>
        </g>

        <!-- Baseline -->
        <line
          :x1="PAD_L"
          :x2="W - PAD_R"
          :y1="PLOT_BOTTOM"
          :y2="PLOT_BOTTOM"
          stroke="var(--viz-axis)"
          stroke-width="1"
        />

        <!-- Soft area wash (~10% opacity) -->
        <path :d="areaPath" fill="var(--viz-series-primary)" fill-opacity="0.10" />

        <!-- 2px crisp line -->
        <path
          :d="linePath"
          fill="none"
          stroke="var(--viz-series-primary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Selective direct label on Peak -->
        <g v-if="peakCoord && peakPoint && peakPoint.revenue > 0">
          <circle
            :cx="peakCoord.x"
            :cy="peakCoord.y"
            r="4.5"
            fill="var(--viz-series-primary)"
            stroke="var(--viz-surface)"
            stroke-width="2"
          />
          <text
            :x="Math.min(Math.max(peakCoord.x, PAD_L + 36), W - PAD_R - 36)"
            :y="Math.max(peakCoord.y - 10, 12)"
            text-anchor="middle"
            class="fill-[var(--viz-text-primary)] text-[10px] font-semibold"
          >
            {{ formatCompactToman(peakPoint.revenue) }}
          </text>
        </g>

        <!-- Crosshair & active snap dot -->
        <g v-if="activeCoord">
          <line
            :x1="activeCoord.x"
            :x2="activeCoord.x"
            :y1="PAD_T"
            :y2="PLOT_BOTTOM"
            stroke="var(--viz-axis)"
            stroke-width="1"
          />
          <circle
            :cx="activeCoord.x"
            :cy="activeCoord.y"
            r="5"
            fill="var(--viz-series-primary)"
            stroke="var(--viz-surface)"
            stroke-width="2"
          />
        </g>

        <!-- X Axis Labels -->
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

        <!-- Wide hit targets (>= 24px or slot width) -->
        <rect
          v-for="(pt, idx) in coords"
          :key="`hit-${idx}`"
          :x="pt.hitX"
          :y="PAD_T"
          :width="pt.hitW"
          :height="PLOT_H"
          fill="transparent"
          tabindex="0"
          class="cursor-crosshair outline-none"
          :aria-label="`${formatBucketLabel(points[idx]!.date, range).full}: ${numberFormat(points[idx]!.revenue)} تومان`"
          @mouseenter="hoverIndex = idx"
          @focus="hoverIndex = idx"
        />
      </svg>

      <!-- Floating Tooltip -->
      <div
        v-if="activePoint && activeCoord"
        dir="rtl"
        class="pointer-events-none absolute top-1 z-10 min-w-44 rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-xs"
        :style="tooltipStyle"
      >
        <p class="font-medium text-gray-500">
          {{ formatBucketLabel(activePoint.date, range).full }}
        </p>
        <div class="mt-1.5 space-y-1">
          <div class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-1.5 text-gray-600">
              <span class="h-0.5 w-3 rounded-full bg-[var(--viz-series-primary)]" />
              درآمد
            </span>
            <span class="font-bold text-gray-900">{{ numberFormat(activePoint.revenue) || '۰' }} تومان</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-gray-500">سفارش‌ها</span>
            <span class="font-semibold text-gray-800">{{ toPersianDigits(activePoint.orders) }}</span>
          </div>
        </div>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { DashboardDailyPoint, DashboardRange } from '@nimoura/shared-types';
import { numberFormat, toPersianDigits } from '@nimoura/utils';
import { formatBucketLabel, formatCompactToman } from '~/composables/useAdminDashboard';

const props = defineProps<{
  points: DashboardDailyPoint[];
  range: DashboardRange;
}>();

const tableMode = ref(false);
const hoverIndex = ref<number | null>(null);

const W = 680;
const H = 228;
const PAD_L = 58;
const PAD_R = 16;
const PAD_T = 22;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const PLOT_BOTTOM = H - PAD_B;

const maxRevenue = computed(() => {
  const max = Math.max(...props.points.map((p) => p.revenue), 0);
  return max > 0 ? max * 1.12 : 100_000;
});

const yTicks = computed(() => {
  const steps = 4;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const ratio = i / steps;
    return {
      value: Math.round(maxRevenue.value * ratio),
      y: PLOT_BOTTOM - ratio * PLOT_H,
    };
  });
});

const coords = computed(() => {
  const n = props.points.length;
  if (!n) return [];
  const slotW = n === 1 ? PLOT_W : PLOT_W / (n - 1);
  return props.points.map((p, i) => {
    const x = n === 1 ? PAD_L + PLOT_W / 2 : PAD_L + i * slotW;
    const y = PLOT_BOTTOM - (p.revenue / maxRevenue.value) * PLOT_H;
    const hitW = Math.max(24, slotW);
    return {
      x,
      y,
      hitX: Math.max(PAD_L, x - hitW / 2),
      hitW: Math.min(hitW, W - PAD_R - Math.max(PAD_L, x - hitW / 2)),
    };
  });
});

const linePath = computed(() =>
  coords.value
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' '),
);

const areaPath = computed(() => {
  if (coords.value.length < 2) return '';
  const first = coords.value[0]!;
  const last = coords.value[coords.value.length - 1]!;
  return `${linePath.value} L ${last.x.toFixed(1)} ${PLOT_BOTTOM} L ${first.x.toFixed(1)} ${PLOT_BOTTOM} Z`;
});

const peakIndex = computed(() => {
  let idx = 0;
  props.points.forEach((p, i) => {
    if (p.revenue >= (props.points[idx]?.revenue ?? 0)) idx = i;
  });
  return idx;
});

const peakPoint = computed(() => props.points[peakIndex.value] ?? null);
const peakCoord = computed(() => coords.value[peakIndex.value] ?? null);

const xLabels = computed(() => {
  const n = props.points.length;
  if (!n) return [];
  const maxTicks = Math.min(n, 7);
  const step = Math.max(1, Math.ceil((n - 1) / (maxTicks - 1 || 1)));
  const out: Array<{ idx: number; x: number; text: string }> = [];
  for (let i = 0; i < n; i += step) {
    out.push({
      idx: i,
      x: coords.value[i]!.x,
      text: formatBucketLabel(props.points[i]!.date, props.range).short,
    });
  }
  const lastIdx = n - 1;
  if (out[out.length - 1]?.idx !== lastIdx) {
    out.push({
      idx: lastIdx,
      x: coords.value[lastIdx]!.x,
      text: formatBucketLabel(props.points[lastIdx]!.date, props.range).short,
    });
  }
  return out;
});

const activePoint = computed(() =>
  hoverIndex.value !== null ? props.points[hoverIndex.value] ?? null : null,
);
const activeCoord = computed(() =>
  hoverIndex.value !== null ? coords.value[hoverIndex.value] ?? null : null,
);

const tooltipStyle = computed(() => {
  if (!activeCoord.value) return {};
  const pct = (activeCoord.value.x / W) * 100;
  return pct > 60
    ? { right: `${100 - pct + 2}%` }
    : { left: `${pct + 2}%` };
});
</script>
