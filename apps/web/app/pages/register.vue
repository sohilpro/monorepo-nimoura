<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50">
    <div class="text-center p-6 bg-white rounded-2xl shadow-sm border border-surface-200/60 max-w-sm mx-auto">
      <div class="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p class="text-sm font-medium text-surface-700">در حال انتقال به صفحه ورود و ثبت‌نام...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const route = useRoute();

// در صورت باز شدن /register با یا بدون ref، بلافاصله به /auth منتقل شود
await navigateTo({ path: "/auth", query: route.query }, { replace: true, redirectCode: 301 });
</script>
