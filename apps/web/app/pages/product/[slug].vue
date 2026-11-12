<template>
  <main>
    <ProductDetailSingle :product-data="productData" :pending="pending" />
  </main>
</template>

<script setup lang="ts">
import { buildCategoryBreadcrumb, createSlug } from '@nimoura/utils';

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

const rawSlug = computed(() => String(route.params.slug || ''));

const asyncProduct = useLazyFetch<any>('/api/products/findOne', {
  query: { slug: rawSlug.value },
  key: `product-detail-${rawSlug.value}`,
});

if (import.meta.server) {
  await asyncProduct;
}

const { data: product, pending, error } = asyncProduct;
const productData = computed(() => product.value?.data ?? null);

if (import.meta.server) {
  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode || 404,
      statusMessage: 'محصول مورد نظر یافت نشد',
    });
  }

  if (!productData.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'محصول مورد نظر یافت نشد',
    });
  }
}

const canonicalSlug = computed(
  () => productData.value?.slug || createSlug(productData.value?.title || rawSlug.value),
);

if (import.meta.server && canonicalSlug.value) {
  let decodedParam = rawSlug.value;
  try {
    decodedParam = decodeURIComponent(rawSlug.value);
  } catch {
    // keep raw
  }

  if (decodedParam !== canonicalSlug.value) {
    await navigateTo(
      {
        path: `/product/${encodeURIComponent(canonicalSlug.value)}`,
        query: route.query,
      },
      { redirectCode: 301 },
    );
  }
}

if (import.meta.client) {
  watch(
    [pending, canonicalSlug],
    async ([isPending, slug]) => {
      if (isPending || !slug) return;
      let decodedParam = rawSlug.value;
      try {
        decodedParam = decodeURIComponent(rawSlug.value);
      } catch {
        // keep raw
      }
      if (decodedParam !== slug) {
        await navigateTo(
          {
            path: `/product/${encodeURIComponent(slug)}`,
            query: route.query,
          },
          { replace: true },
        );
      }
    },
    { immediate: true },
  );
}

function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const canonicalUrl = computed(
  () => `${siteUrl}/product/${encodeURIComponent(canonicalSlug.value)}`,
);

const pageTitle = computed(() => {
  const p = productData.value;
  if (!p) return 'جزئیات محصول | فروشگاه نیمورا';
  return p.brand?.name
    ? `خرید ${p.title} برند ${p.brand.name} | فروشگاه لوازم آرایشی نیمورا`
    : `${p.title} | فروشگاه لوازم آرایشی نیمورا`;
});

const pageDescription = computed(() => {
  const p = productData.value;
  const raw = stripHtml(p?.shortDescription) || stripHtml(p?.introduce);
  if (raw) return raw.slice(0, 160);
  const title = p?.title || 'محصول آرایشی و مراقبتی';
  return `مشاهده قیمت، مشخصات و خرید اینترنتی ${title} با ضمانت اصالت کالا و ارسال سریع از فروشگاه اینترنتی نیمورا.`;
});

const productImages = computed(() => {
  const p = productData.value;
  if (!p) return [`${siteUrl}/og-image.png`];
  const urls = [
    p.thumbnail,
    ...(p.images?.map((img: any) => img?.url) ?? []),
  ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
  return urls.length ? Array.from(new Set(urls)) : [`${siteUrl}/og-image.png`];
});

const isProductInStock = computed(() => {
  const p = productData.value;
  if (!p || p.isAvailable === false) return false;
  if (p.type === 'variant' && p.variants?.length) {
    return p.variants.some((v: any) => v.isAvailable !== false && Number(v.stock ?? 0) > 0);
  }
  return Number(p.stock ?? 0) > 0;
});

const offerPricing = computed(() => {
  const p = productData.value;
  if (!p) return { lowPrice: 0, highPrice: 0, count: 1 };

  if (p.type === 'variant' && p.variants?.length) {
    const prices = p.variants
      .map((v: any) => {
        const base = Number(v.price) || 0;
        const disc = Number(v.priceDiscount) || 0;
        return disc > 0 && disc < base ? disc : base;
      })
      .filter((n: number) => n > 0);

    if (prices.length) {
      return {
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        count: prices.length,
      };
    }
  }

  const base = Number(p.price) || 0;
  const disc = Number(p.priceDiscount) || 0;
  const effective = disc > 0 && disc < base ? disc : base;
  return { lowPrice: effective, highPrice: effective, count: 1 };
});

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogImage: () => productImages.value[0],
  ogUrl: () => canonicalUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value,
  twitterImage: () => productImages.value[0],
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: () => canonicalUrl.value,
    },
  ],
  meta: [
    { property: 'og:type', content: 'product' },
    {
      property: 'product:price:amount',
      content: () => String(offerPricing.value.lowPrice || 0),
    },
    { property: 'product:price:currency', content: 'IRT' },
    {
      property: 'product:availability',
      content: () => (isProductInStock.value ? 'instock' : 'oos'),
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => {
        const p = productData.value;
        if (!p) return '{}';

        const availabilityUrl = isProductInStock.value
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock';

        const isAggregate =
          offerPricing.value.count > 1 &&
          offerPricing.value.lowPrice !== offerPricing.value.highPrice;

        const offers = isAggregate
          ? {
              '@type': 'AggregateOffer',
              priceCurrency: 'IRT',
              lowPrice: offerPricing.value.lowPrice,
              highPrice: offerPricing.value.highPrice,
              offerCount: offerPricing.value.count,
              availability: availabilityUrl,
              url: canonicalUrl.value,
            }
          : {
              '@type': 'Offer',
              priceCurrency: 'IRT',
              price: offerPricing.value.lowPrice,
              availability: availabilityUrl,
              itemCondition: 'https://schema.org/NewCondition',
              url: canonicalUrl.value,
              seller: {
                '@type': 'Organization',
                name: 'Nimoura',
                url: siteUrl,
              },
            };

        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.title,
          ...(p.englishTitle ? { alternateName: p.englishTitle } : {}),
          image: productImages.value,
          description: pageDescription.value,
          sku: p.sku || String(p.id),
          ...(p.category?.name ? { category: p.category.name } : {}),
          ...(p.brand
            ? {
                brand: {
                  '@type': 'Brand',
                  name: p.brand.name,
                },
              }
            : {}),
          offers,
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
        const p = productData.value;
        if (!p) return '{}';
        const breadcrumbs = buildCategoryBreadcrumb(
          p.category,
          '/categories',
          { currentLabel: p.title },
        );
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href ? `${siteUrl}${item.href}` : canonicalUrl.value,
          })),
        });
      }),
    },
  ],
});
</script>
