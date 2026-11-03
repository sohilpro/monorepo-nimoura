<template>
  <BrandForm mode="update" :brand-id="brandId" />
</template>

<script setup lang="ts">
const route = useRoute();
const brandId = computed(() => (route.params.slug || route.params.id) as string);
</script>
