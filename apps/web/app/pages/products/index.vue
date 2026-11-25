<template>
  <section>
    <BannersSlot
      position-key="products-top"
      layout="single"
      spacing-class="mt-3 sm:mt-5"
    />
    <Categories />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  key: (route) => route.fullPath,
});

const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';
const canonicalUrl = `${siteUrl}/products`;

const pageTitle = 'همه محصولات آرایشی و مراقبتی | فروشگاه نیمورا';
const pageDescription =
  'مشاهده و خرید تمام محصولات آرایشی، پوستی و مراقبتی فروشگاه نیمورا با فیلتر دستهبندی، برند، قیمت و ضمانت اصالت کالا.';

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});

const jsonLdScripts: any[] = [
  {
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'همه محصولات',
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
      name: 'همه محصولات نیمورا',
      description: pageDescription,
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: 'Nimoura', url: siteUrl },
    }),
  },
];

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: jsonLdScripts,
});
</script>