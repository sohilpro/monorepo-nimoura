<template>
  <div v-if="topBadges.length || lowStock" class="pointer-events-none absolute inset-0 z-[5]">
    <!-- top-start (right in RTL): new / bundle / amazing offer -->
    <div
      v-if="topBadges.length"
      class="absolute start-2 top-2 flex flex-col items-start gap-1"
    >
      <span
        v-for="badge in topBadges"
        :key="badge.type"
        class="rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 backdrop-blur-sm"
        :class="toneClass[badge.tone] ?? toneClass.neutral"
      >
        {{ badge.label }}
      </span>
    </div>

    <!-- bottom: scarcity -->
    <span
      v-if="lowStock"
      class="absolute inset-x-2 bottom-2 truncate rounded-full bg-nimoura-velvet/85 px-2.5 py-0.5 text-center text-[10px] font-medium text-nimoura-base backdrop-blur-sm"
    >
      {{ lowStock.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ProductBadge } from '@nimoura/shared-types';

const props = defineProps<{ badges?: ProductBadge[]; max?: number }>();

const toneClass: Record<string, string> = {
  danger: 'bg-nimoura-primary/90 text-white',
  warning: 'bg-nimoura-base/95 text-nimoura-primary border border-nimoura-primary/25',
  success: 'bg-white/95 text-nimoura-success border border-nimoura-success/30',
  info: 'bg-nimoura-accent/60 text-nimoura-velvet border border-nimoura-accent',
  neutral: 'bg-white/90 text-nimoura-text-700 border border-nimoura-text-100',
};

const lowStock = computed(() => props.badges?.find((b) => b.type === 'low_stock'));

// discount and out-of-stock have their own treatment on the card
const topBadges = computed(() =>
  (props.badges ?? [])
    .filter((b) => ['new', 'bundle', 'amazing_offer'].includes(b.type))
    .slice(0, props.max ?? 2),
);
</script>
