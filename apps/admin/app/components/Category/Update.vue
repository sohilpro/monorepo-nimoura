<template>
  <CategoryForm mode="update" :category-id="categoryId" />
</template>

<script setup lang="ts">
const route = useRoute();
const categoryId = computed(() => route.params.slug as string);
</script>
