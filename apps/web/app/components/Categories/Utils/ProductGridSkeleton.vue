<template>
  <div
    class="grid grid-cols-2 gap-2 xs:gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 2xl:grid-cols-5"
  >
    <div
      v-for="i in count"
      :key="i"
      class="flex h-full flex-col overflow-hidden rounded-2xl border border-nimoura-text-100 bg-white p-1.5 sm:p-2"
    >
      <!-- PRODUCT IMAGE SKELETON (ASPECT SQUARE) -->
      <div class="aspect-square w-full shrink-0 overflow-hidden rounded-xl">
        <Skeleton width="100%" height="100%" border-radius="0.75rem" />
      </div>

      <!-- PRODUCT BODY SKELETON -->
      <div class="mt-2 flex flex-1 flex-col gap-1.5 px-0.5">
        <!-- TITLE (2 LINES) -->
        <Skeleton width="92%" height="0.75rem" border-radius="0.375rem" />
        <Skeleton width="65%" height="0.75rem" border-radius="0.375rem" />

        <!-- PRICE SECTION (ALIGNED END/LEFT) -->
        <div class="mt-auto flex flex-col items-end gap-1 pt-2">
          <!-- OLD PRICE -->
          <Skeleton width="35%" height="0.65rem" border-radius="0.25rem" />
          <!-- CURRENT PRICE -->
          <Skeleton width="55%" height="0.95rem" border-radius="0.375rem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 10,
  }
);
</script>