<template>
  <section>
    <Categories :category-data="category" />
  </section>
</template>

<script setup lang="ts">
import { buildCategoryBreadcrumb, createSlug } from '@nimoura/utils';
import type { Category } from '@nimoura/shared-types';

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

const rawSlug = computed(() => String(route.params.slug || ''));

const { data: catResponse, error: catError } = await useFetch<any>(
  () => `/api/categories/${encodeURIComponent(rawSlug.value)}`,
  { key: `category-meta-${String(route.params.slug || '')}` },
);

if (catError.value) {
  throw createError({
    statusCode: catError.value.statusCode || 404,
    statusMessage: 'دسته‌بندی مورد نظر یافت نشد',
  });
}

const category = computed<Category | null>(
  () => catResponse.value?.data ?? catResponse.value ?? null,
);

// اگر اسلاگ در URL با اسلاگ رسمی ثبت‌شده متفاوت باشد، ریدایرکت ۳۰۱ انجام بده
if (category.value?.slug) {
  let decodedParam = rawSlug.value;
  try {
    decodedParam = decodeURIComponent(rawSlug.value);
  } catch {
    // keep raw
  }
  if (decodedParam !== category.value.slug) {
    await navigateTo(
      {
        path: `/categories/${encodeURIComponent(category.value.slug)}`,
        query: route.query,
      },
      { redirectCode: 301 },
    );
  }
}

const canonicalSlug = computed(
  () => category.value?.slug || rawSlug.value,
);

const canonicalUrl = computed(
  () => `${siteUrl}/categories/${encodeURIComponent(canonicalSlug.value)}`,
);

const pageTitle = computed(() => {
  if (category.value?.seoTitle?.trim()) return category.value.seoTitle.trim();
  const name = category.value?.name || decodeURIComponent(rawSlug.value).replace(/-/g, ' ');
  return `خرید انواع ${name} | فروشگاه لوازم آرایشی نیمورا`;
});

const pageDescription = computed(() => {
  if (category.value?.seoDescription?.trim()) {
    return category.value.seoDescription.trim();
  }
  const name = category.value?.name || decodeURIComponent(rawSlug.value).replace(/-/g, ' ');
  return `مشاهده قیمت و خرید بهترین محصولات ${name} با ضمانت اصالت کالا، نقد و بررسی و ارسال سریع از فروشگاه اینترنتی نیمورا.`;
});

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
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
        if (!category.value) return '{}';
        const breadcrumbs = buildCategoryBreadcrumb(category.value);
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href
              ? `${siteUrl}${item.href}`
              : canonicalUrl.value,
          })),
        });
      }),
    },
    {
      type: 'application/ld+json',
      children: computed(() => {
        if (!category.value) return '{}';
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.value.name,
          description: pageDescription.value,
          url: canonicalUrl.value,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Nimoura',
            url: siteUrl,
          },
          ...(category.value.children?.length
            ? {
                hasPart: category.value.children.map((child) => ({
                  '@type': 'CollectionPage',
                  name: child.name,
                  url: `${siteUrl}/categories/${encodeURIComponent(child.slug || createSlug(child.name))}`,
                })),
              }
            : {}),
        });
      }),
    },
  ],
});
</script>
