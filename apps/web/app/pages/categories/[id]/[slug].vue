<template>
  <section>
    <Categories />
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

const categoryTitle = computed(() => {
  const slug = route.params.slug as string;
  return slug ? decodeURIComponent(slug).replace(/-/g, ' ') : 'دسته‌بندی محصولات';
});

useSeoMeta({
  title: () => `خرید انواع ${categoryTitle.value} | فروشگاه اینترنتی نیمورا`,
  description: () =>
    `مشاهده قیمت و خرید بهترین محصولات ${categoryTitle.value} با ضمانت کیفیت و اصالت کالا و ارسال سریع در نیمورا.`,
  ogTitle: () => `${categoryTitle.value} | نیمورا`,
  ogDescription: () =>
    `لیست جدیدترین و پرفروش‌ترین محصولات ${categoryTitle.value} در نیمورا`,
  ogUrl: () => `${siteUrl}/categories/${route.params.id}/${route.params.slug}`,
  twitterCard: 'summary_large_image',
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: () => `${siteUrl}/categories/${route.params.id}/${route.params.slug}`,
    },
  ],
});
</script>
