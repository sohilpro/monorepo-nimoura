<template>
  <ProductCard
    v-for="product in products"
    :key="product.id"
    :product="product"
    variant="grid"
    show-badges
  />
</template>

<script setup lang="ts">
defineProps<{
  products: any[];
}>();
</script>
