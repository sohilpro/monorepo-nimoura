<template>
  <section>
    <Categories />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  key: (route) => route.fullPath,
});

const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';
const canonicalUrl = `${siteUrl}/products/newest`;

const pageTitle = 'جدیدترین محصولات آرایشی و مراقبتی | فروشگاه نیمورا';
const pageDescription =
  'مشاهده و خرید جدیدترین محصولات آرایشی، پوستی و مراقبتی اضافه‌شده به فروشگاه اینترنتی نیمورا با ضمانت اصالت کالا و ارسال سریع.';

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'خانه',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'جدیدترین محصولات',
            item: canonicalUrl,
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'جدیدترین محصولات نیمورا',
        description: pageDescription,
        url: canonicalUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Nimoura',
          url: siteUrl,
        },
      }),
    },
  ],
});
</script>
