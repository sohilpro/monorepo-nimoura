<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// هدایت خودکار به صفحه اصلی مجله با فیلتر دسته‌بندی
await navigateTo({
  path: '/magazine',
  query: { category: slug },
}, { replace: true });
</script>

<template>
  <div class="flex items-center justify-center min-h-[50vh]">
    <i class="pi pi-spin pi-spinner text-nimoura-primary text-2xl" />
  </div>
</template>
