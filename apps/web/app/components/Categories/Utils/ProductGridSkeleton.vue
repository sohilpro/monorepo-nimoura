<template>
  <div
    class="grid grid-cols-2 gap-2 xs:gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 2xl:grid-cols-5"
  >
    <ProductCardSkeleton
      v-for="i in count"
      :key="i"
      variant="grid"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 9,
  },
);
</script>