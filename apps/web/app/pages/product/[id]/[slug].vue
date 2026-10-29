<template>
  <main>
    <ProductDetailSingle />
  </main>
</template>

<script setup lang="ts">
import { buildCategoryBreadcrumb } from '@nimoura/utils';

const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

const { data: product } = await useFetch<any>('/api/products/findOne', {
  query: { id: route.params.id },
  key: `product-seo-${route.params.id}`,
});

const productData = computed(() => product.value?.data);

useSeoMeta({
  title: () =>
    productData.value
      ? `${productData.value.title} | فروشگاه لوازم آرایشی نیمورا`
      : 'جزئیات محصول | فروشگاه نیمورا',
  description: () =>
    productData.value?.description ||
    productData.value?.introduce ||
    'خرید اینترنتی محصولات آرایشی و زیبایی با بالاترین کیفیت، ارسال سریع و ضمانت اصالت کالا از نیمورا.',
  ogTitle: () =>
    productData.value?.title
      ? `${productData.value.title} | نیمورا`
      : 'نیمورا',
  ogDescription: () =>
    productData.value?.description ||
    'خرید بهترین لوازم آرایشی و مراقبت پوستی از نیمورا',
  ogImage: () =>
    productData.value?.images?.[0]?.url || `${siteUrl}/og-image.png`,
  ogUrl: () => `${siteUrl}/product/${route.params.id}/${route.params.slug}`,
  twitterCard: 'summary_large_image',
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: () => `${siteUrl}/product/${route.params.id}/${route.params.slug}`,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => {
        if (!productData.value) return '{}';
        const p = productData.value;
        const mainImage = p.images?.[0]?.url || '';
        const effectivePrice =
          p.priceDiscount && p.priceDiscount > 0 ? p.priceDiscount : p.price;

        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.title,
          image: mainImage ? [mainImage] : [],
          description: p.description || p.introduce || p.title,
          sku: String(p.id),
          brand: p.brand
            ? {
                '@type': 'Brand',
                name: p.brand.name,
              }
            : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'IRT',
            price: effectivePrice,
            availability:
              p.isAvailable && p.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `${siteUrl}/product/${route.params.id}/${route.params.slug}`,
          },
          ...(p.averageRating && p.ratingsCount > 0
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: p.averageRating,
                  reviewCount: p.ratingsCount,
                },
              }
            : {}),
        });
      }),
    },
    {
      type: 'application/ld+json',
      children: computed(() => {
        if (!productData.value?.category) return '{}';
        const breadcrumbs = buildCategoryBreadcrumb(productData.value.category);
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href ? `${siteUrl}${item.href}` : undefined,
          })),
        });
      }),
    },
  ],
});
</script>
