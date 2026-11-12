<template>
  <section>
    <Categories :brand-data="brand" />
  </section>
</template>

<script setup lang="ts">
import { buildBrandBreadcrumb, createSlug } from '@nimoura/utils';
import type { Brand } from '@nimoura/shared-types';

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

const rawSlug = computed(() => String(route.params.slug || ''));
const legacyBrandId = computed(() =>
  typeof route.query.id === 'string' && /^\d+$/.test(route.query.id)
    ? route.query.id
    : null,
);
const lookupIdentifier = computed(() => legacyBrandId.value || rawSlug.value);

const { data: brandResponse, error: brandError } = await useFetch<any>(
  () => `/api/brands/${encodeURIComponent(lookupIdentifier.value)}`,
  { key: `brand-meta-${lookupIdentifier.value}` },
);

if (brandError.value) {
  throw createError({
    statusCode: brandError.value.statusCode || 404,
    statusMessage: 'برند مورد نظر یافت نشد',
  });
}

const brand = computed<Brand | null>(
  () => brandResponse.value?.data ?? brandResponse.value ?? null,
);

if (!brand.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'برند مورد نظر یافت نشد',
  });
}

if (brand.value?.slug) {
  let decodedParam = rawSlug.value;
  try {
    decodedParam = decodeURIComponent(rawSlug.value);
  } catch {
    // keep raw
  }

  const legacySubId = Number(route.query.subBrandId);
  const matchedSub =
    Number.isFinite(legacySubId) && legacySubId > 0
      ? brand.value.subBrands?.find((sb) => sb.id === legacySubId)
      : undefined;

  const { id: _id, subBrandId: _subId, ...cleanQuery } = route.query;

  if (matchedSub) {
    const subSlug = matchedSub.slug || createSlug(matchedSub.name);
    await navigateTo(
      {
        path: `/brand/${encodeURIComponent(brand.value.slug)}/${encodeURIComponent(subSlug)}`,
        query: cleanQuery,
      },
      { redirectCode: 301 },
    );
  } else if (decodedParam !== brand.value.slug || route.query.id !== undefined) {
    await navigateTo(
      {
        path: `/brand/${encodeURIComponent(brand.value.slug)}`,
        query: cleanQuery,
      },
      { redirectCode: 301 },
    );
  }
}

const canonicalSlug = computed(
  () => brand.value?.slug || createSlug(brand.value?.name || rawSlug.value),
);

const canonicalUrl = computed(
  () => `${siteUrl}/brand/${encodeURIComponent(canonicalSlug.value)}`,
);

const pageTitle = computed(() => {
  const name = brand.value?.name || decodeURIComponent(rawSlug.value).replace(/-/g, ' ');
  return `خرید محصولات برند ${name} | فروشگاه لوازم آرایشی نیمورا`;
});

const plainDescription = computed(() =>
  (brand.value?.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
);

const pageDescription = computed(() => {
  if (plainDescription.value) {
    return plainDescription.value.slice(0, 160);
  }
  const name = brand.value?.name || decodeURIComponent(rawSlug.value).replace(/-/g, ' ');
  return `مشاهده قیمت و خرید انواع محصولات اصل برند ${name} با ضمانت اصالت کالا و ارسال سریع از فروشگاه اینترنتی نیمورا.`;
});

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogImage: () => brand.value?.logo || `${siteUrl}/og-image.png`,
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: () => canonicalUrl.value,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => {
        if (!brand.value) return '{}';
        const breadcrumbs = buildBrandBreadcrumb(brand.value);
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
    {
      type: 'application/ld+json',
      children: computed(() => {
        if (!brand.value) return '{}';
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: brand.value.name,
          description: pageDescription.value,
          url: canonicalUrl.value,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Nimoura',
            url: siteUrl,
          },
          ...(brand.value.subBrands?.length
            ? {
                hasPart: brand.value.subBrands.map((sb) => ({
                  '@type': 'CollectionPage',
                  name: sb.name,
                  url: `${siteUrl}/brand/${encodeURIComponent(canonicalSlug.value)}/${encodeURIComponent(sb.slug || createSlug(sb.name))}`,
                })),
              }
            : {}),
        });
      }),
    },
  ],
});
</script>
