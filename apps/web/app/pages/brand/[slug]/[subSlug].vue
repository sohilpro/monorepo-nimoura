<template>
  <section>
    <Categories :brand-data="brandWithSub" />
  </section>
</template>

<script setup lang="ts">
import { buildBrandBreadcrumb, createSlug } from '@nimoura/utils';
import type { Brand, SubBrand } from '@nimoura/shared-types';

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

const rawBrandSlug = computed(() => String(route.params.slug || ''));
const rawSubSlug = computed(() => String(route.params.subSlug || ''));
const legacyBrandId = computed(() =>
  typeof route.query.id === 'string' && /^\d+$/.test(route.query.id)
    ? route.query.id
    : null,
);
const lookupIdentifier = computed(() => legacyBrandId.value || rawBrandSlug.value);

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

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const decodedBrandParam = computed(() => decodeSafe(rawBrandSlug.value));
const decodedSubParam = computed(() => decodeSafe(rawSubSlug.value));

const activeSubBrand = computed<SubBrand | null>(() => {
  const subs = brand.value?.subBrands ?? [];
  const legacySubId = Number(route.query.subBrandId);
  if (Number.isFinite(legacySubId) && legacySubId > 0) {
    const byId = subs.find((sb) => sb.id === legacySubId);
    if (byId) return byId;
  }

  const target = decodedSubParam.value;
  const generated = createSlug(target);
  return (
    subs.find(
      (sb) =>
        sb.slug === target ||
        sb.slug === generated ||
        createSlug(sb.name) === generated,
    ) ?? null
  );
});

if (!activeSubBrand.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'زیربرند مورد نظر یافت نشد',
  });
}

const canonicalBrandSlug = computed(
  () => brand.value?.slug || createSlug(brand.value?.name || rawBrandSlug.value),
);
const canonicalSubSlug = computed(
  () =>
    activeSubBrand.value?.slug ||
    createSlug(activeSubBrand.value?.name || rawSubSlug.value),
);

if (
  decodedBrandParam.value !== canonicalBrandSlug.value ||
  decodedSubParam.value !== canonicalSubSlug.value ||
  route.query.id !== undefined ||
  route.query.subBrandId !== undefined
) {
  const { id: _id, subBrandId: _subId, ...cleanQuery } = route.query;
  await navigateTo(
    {
      path: `/brand/${encodeURIComponent(canonicalBrandSlug.value)}/${encodeURIComponent(canonicalSubSlug.value)}`,
      query: cleanQuery,
    },
    { redirectCode: 301 },
  );
}

const brandWithSub = computed(() =>
  brand.value
    ? {
        ...brand.value,
        subBrand: activeSubBrand.value,
      }
    : null,
);

const canonicalUrl = computed(
  () =>
    `${siteUrl}/brand/${encodeURIComponent(canonicalBrandSlug.value)}/${encodeURIComponent(canonicalSubSlug.value)}`,
);

const pageTitle = computed(() => {
  const brandName = brand.value?.name || '';
  const subName = activeSubBrand.value?.name || '';
  return `خرید محصولات ${subName} از برند ${brandName} | فروشگاه لوازم آرایشی نیمورا`;
});

const pageDescription = computed(() => {
  const brandName = brand.value?.name || '';
  const subName = activeSubBrand.value?.name || '';
  return `مشاهده قیمت و خرید انواع محصولات اصل ${subName} برند ${brandName} با ضمانت اصالت کالا و ارسال سریع از فروشگاه اینترنتی نیمورا.`;
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
        if (!brandWithSub.value) return '{}';
        const breadcrumbs = buildBrandBreadcrumb(brandWithSub.value);
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
        if (!brandWithSub.value) return '{}';
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${brandWithSub.value.name} — ${activeSubBrand.value?.name ?? ''}`,
          description: pageDescription.value,
          url: canonicalUrl.value,
          isPartOf: {
            '@type': 'CollectionPage',
            name: brandWithSub.value.name,
            url: `${siteUrl}/brand/${encodeURIComponent(canonicalBrandSlug.value)}`,
          },
        });
      }),
    },
  ],
});
</script>
