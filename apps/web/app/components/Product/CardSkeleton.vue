<template>
  <div
    class="flex flex-col overflow-hidden rounded-2xl border bg-white"
    :class="
      isGrid
        ? 'h-full w-full border-nimoura-text-100 p-2 sm:p-2.5'
        : 'h-[220px] w-[148px] border-nimoura-border/30 p-3'
    "
  >
    <div
      :class="
        isGrid
          ? 'aspect-square w-full shrink-0 overflow-hidden rounded-xl'
          : 'flex h-27 shrink-0 items-center justify-center'
      "
    >
      <Skeleton
        :width="isGrid ? '100%' : '6rem'"
        :height="isGrid ? '100%' : '6rem'"
        :border-radius="isGrid ? '0.75rem' : '0.5rem'"
      />
    </div>

    <div
      class="flex flex-1 flex-col space-y-1.5"
      :class="isGrid ? 'mt-2 px-0.5' : 'mt-1'"
    >
      <Skeleton
        :width="isGrid ? '92%' : '100%'"
        height="0.75rem"
        border-radius="0.375rem"
      />
      <Skeleton width="65%" height="0.75rem" border-radius="0.375rem" />

      <div
        class="mt-auto flex flex-col items-end gap-1 pt-2"
        :class="isGrid ? 'px-0.5' : ''"
      >
        <Skeleton
          :width="isGrid ? '35%' : '3rem'"
          height="0.65rem"
          border-radius="0.25rem"
        />
        <Skeleton
          :width="isGrid ? '55%' : '4.5rem'"
          :height="isGrid ? '0.9rem' : '0.85rem'"
          border-radius="0.375rem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'compact' | 'grid';
  }>(),
  {
    variant: 'compact',
  },
);

const isGrid = computed(() => props.variant === 'grid');
</script>
