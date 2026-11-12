<template>
  <div>
    <MainBannerHeader />
    <!-- <BannersSlot position-key="hero-home" layout="carousel" height-class="" /> -->
    <Shop3dEntry variant="hero" source="home" />
    <!-- <Shop3dEntry variant="link" source="product" :product="product.slug" /> -->
    <Shop3dEntry variant="link" source="category" zone="makeup" label="برو به بخش آرایش در مغازه" />
    <!-- :href="categoryHref(1, 'لوازم آرایشی')" -->
    <LazyUtilsProductSlider
      title="لوازم"
      sub-title="آرایشی"
      description="زیبایی رو از نیمورا بخواه"
      endpoint="/api/products/category?categoryId=1&limit=15"
      :href="categoryHref(1, 'لوازم آرایشی')"
    />

    <!-- <LazyMainCategory /> -->

    <LazyMainAmazingSlider />



    <LazyUtilsProductSlider
      title="جدید ترین"
      sub-title="محصولات"
      description="جدیدترین و بروزترین محصولات"
      endpoint="/api/products/list?sort=newest&limit=15"
      href="/products/newest"
    />

    <!-- <LazyClientOnly>
      <LazyMainBanner :banners="bannersGroup1" />
      <template #fallback>
        <SkeletonLoadingMiddleBanner />
      </template>
    </LazyClientOnly> -->

     <!-- <LazyVideoSlider /> -->

    <LazyUtilsProductSlider
      title="پر فروش ترین"
      sub-title="محصولات"
      description="پر فروش بین همه"
      href="/products/best-seller"
      endpoint="/api/products/list?sort=popular&limit=15"
    />

   

    <!-- <LazyClientOnly>
      <LazyMainBanner :banners="bannersGroup2" />
      <template #fallback>
        <SkeletonLoadingMiddleBanner />
      </template>
    </LazyClientOnly> -->

    <LazyUtilsProductSlider
      title="محصولات"
      sub-title="مراقب پوستی"
      description="بیشتر مراقب پوستت باش"
      :href="categoryHref(4, 'مراقبت پوستی')"
      endpoint="/api/products/category?categoryId=4&limit=15"
    />

    <!-- <LazyClientOnly>
      <LazyMainBanner :banners="bannersGroup3" />
      <template #fallback>
        <SkeletonLoadingMiddleBanner />
      </template>
    </LazyClientOnly> -->

    <LazyMainBrands />
  </div>
</template>

<script setup lang="ts">
import { createSlug } from '@nimoura/utils';

const { categories } = useCategories();

function categoryHref(id: number, fallbackName: string): string {
  const stack = [...(categories.value ?? [])];
  while (stack.length) {
    const node = stack.shift()!;
    if ((node.id === id || node.name?.trim() === fallbackName.trim()) && node.slug) {
      return `/categories/${node.slug}`;
    }
    if (node.children?.length) {
      stack.push(...node.children);
    }
  }
  return `/categories/${id}/${createSlug(fallbackName)}`;
}

const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

useSeoMeta({
  title: 'فروشگاه لوازم آرایشی و زیبایی نیمورا | خرید آنلاین با ضمانت اصالت',
  description:
    'خرید انواع لوازم آرایشی، مراقبت پوستی و زیبایی از برندهای معتبر با قیمت مناسب، ارسال سریع و ضمانت اصالت کالا در فروشگاه اینترنتی نیمورا.',
  ogTitle: 'فروشگاه لوازم آرایشی و بهداشتی نیمورا',
  ogDescription:
    'خرید اینترنتی محصولات آرایشی، پوستی و مراقبتی با بهترین کیفیت و تضمین اصالت.',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: siteUrl,
  twitterCard: 'summary_large_image',
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: siteUrl,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Nimoura',
        alternateName: 'نیمورا',
        url: siteUrl,
        logo: `${siteUrl}/logo/favicon_256x256.png`,
        description:
          'فروشگاه آنلاین محصولات آرایشی، بهداشتی و مراقبت پوست و مو نیمورا.',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          areaServed: 'IR',
          availableLanguage: 'Persian',
        },
      }),
    },
  ],
});
</script>
