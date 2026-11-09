<template>
  <div v-if="topBadges.length || lowStock" class="pointer-events-none absolute inset-0 z-[5]">
    <!-- top-right: new / bundle / amazing offer -->
    <div class="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
      <span
        v-for="badge in topBadges"
        :key="badge.type"
        class="rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 shadow-sm"
        :class="toneClass[badge.tone]"
      >
        {{ badge.label }}
      </span>
    </div>

    <!-- bottom: scarcity -->
    <span
      v-if="lowStock"
      class="absolute inset-x-1.5 bottom-1.5 truncate rounded-lg bg-amber-500/95 px-2 py-1 text-center text-[10px] font-medium text-white shadow-sm backdrop-blur-sm"
    >
      {{ lowStock.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ProductBadge } from '@nimoura/shared-types';

const props = defineProps<{ badges?: ProductBadge[]; max?: number }>();

const toneClass: Record<string, string> = {
  danger: 'bg-rose-500 text-white',
  warning: 'bg-amber-400 text-amber-950',
  success: 'bg-emerald-500 text-white',
  info: 'bg-sky-500 text-white',
  neutral: 'bg-white text-nimoura-text-700',
};

const lowStock = computed(() => props.badges?.find((b) => b.type === 'low_stock'));

// discount and out-of-stock have their own treatment on the card
const topBadges = computed(() =>
  (props.badges ?? [])
    .filter((b) => ['new', 'bundle', 'amazing_offer'].includes(b.type))
    .slice(0, props.max ?? 2),
);
</script>
