<template>
  <BannerForm mode="update" :banner-id="bannerId" />
</template>

<script setup lang="ts">
const route = useRoute();
const bannerId = computed(() => route.params.slug as string);
</script>
