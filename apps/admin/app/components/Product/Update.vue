<template>
  <ProductForm mode="update" :product-id="productId" />
</template>

<script setup lang="ts">
const route = useRoute();
const productId = computed(() => route.params.slug as string);
</script>
