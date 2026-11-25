<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- ══ ۱. هدر اسلایدر بنرهای هیرو (BannersSlot) ══ -->
    <BannersSlot
      position-key="hero-home"
      layout="carousel"
      height-class="aspect-[16/7] sm:aspect-[21/8] lg:aspect-[3/1]"
      spacing-class="mt-3 sm:mt-5"
    />

    <!-- ══ ۲. شوکیس شبکه‌ای دسته‌بندی‌های برگزیده (Grid Variant) ══ -->
    <CategoriesShowcase
      config-key="home-grid"
      title="دسته‌بندی‌های"
      highlight="برگزیده"
      subtitle="محصولات تخصصی زیبایی، مراقبت و سلامت پوست و مو"
      variant="grid"
      badge-text="خرید بر اساس دسته‌بندی"
      :limit="6"
    />

    <!-- ══ ۳. پیشنهادات شگفت‌انگیز با تایمر معکوس ══ -->
    <LazyMainAmazingSlider />

    <!-- ══ ۴. نشان‌های ارزش و اعتماد نیمورا ══ -->
    <MainTrustSignals />

    <!-- ══ ۵. بنرهای تبلیغاتی دوتایی میانی (BannersSlot - Grid 2) ══ -->
    <BannersSlot
      position-key="home-middle-banners"
      layout="grid-2"
      spacing-class="my-6 sm:my-10"
    />

    <!-- ══ ۶. جدیدترین محصولات ══ -->
    <LazyUtilsProductSlider
      title="جدیدترین"
      sub-title="محصولات"
      description="تازه‌ترین محصولات آرایشی و مراقبتی اضافه شده به نیمورا"
      endpoint="/api/products?sort=newest&limit=15"
      href="/products/newest"
    />

    <!-- ══ ۷. اسلایدر تب‌دار دسته‌بندی‌های زیبایی (ProductSliderTabs) ══ -->
    <LazyUtilsProductSliderTabs
      :container="true"
      title="مجموعه منتخب"
      sub-title="لاین‌های زیبایی"
      icon="pi-sparkles"
      :tabs="beautyTabs"
      :hide-when-empty="false"
    />

    <!-- ══ ۸. کارت‌های شوکیس هیرو (Hero Cards Variant) ══ -->
    <CategoriesShowcase
      config-key="home-hero-cards"
      title="لاین‌های ویژه"
      highlight="نیمورا"
      subtitle="دسترسی سریع به محبوب‌ترین مجموعه‌های تخصصی آرایشی و درمانی"
      variant="hero-cards"
      badge-text="کالکشن برگزیده"
      :limit="3"
    />

    <!-- ══ ۹. بنر ورود به مغازه سه‌بعدی نیمورا ══ -->
    <Shop3dEntry variant="hero" source="home" />

    <!-- ══ ۱۰. پرفروش‌ترین محصولات ══ -->
    <LazyUtilsProductSlider
      title="پرفروش‌ترین"
      sub-title="محصولات"
      description="محبوب‌ترین و پرطرفدارترین انتخاب‌های خریداران"
      endpoint="/api/products?sort=popular&limit=15"
      href="/products/best-seller"
    />

    <!-- ══ ۱۱. شوکیس دایره‌ای روتین‌های محبوب (Circle Variant) ══ -->
    <CategoriesShowcase
      config-key="home-circle"
      title="روتین‌های محبوب"
      highlight="زیبایی و سلامت"
      subtitle="محبوب‌ترین لاین‌ها برای مراقبت روزمره از پوست، مو و چهره"
      variant="radial"
      badge-text="پیشنهاد متخصصان"
      :limit="6"
    />

    <!-- ══ ۱۲. بنرهای چهارتایی پایین صفحه (BannersSlot - Grid 4) ══ -->
    <BannersSlot
      position-key="home-bottom-banners"
      layout="grid-4"
      :mobile-scroll="true"
      spacing-class="my-6 sm:my-10"
    />

    <!-- ══ ۱۳. محصولات لاین لوازم آرایشی ══ -->
    <LazyUtilsProductSlider
      title="لوازم"
      sub-title="آرایشی"
      description="زیبایی و درخشش طبیعی با محصولات برگزیده آرایشی"
      :endpoint="categoryEndpoint('لوازم آرایشی', 1)"
      :href="categoryHref(1, 'لوازم آرایشی')"
    />

    <!-- ══ ۱۴. محصولات لاین مراقبت پوستی ══ -->
    <LazyUtilsProductSlider
      title="محصولات"
      sub-title="مراقبت پوستی"
      description="محصولات تخصصی برای سلامت، آبرسانی و شادابی پوست"
      :endpoint="categoryEndpoint('مراقبت پوستی', 4)"
      :href="categoryHref(4, 'مراقبت پوستی')"
    />

    <!-- ══ ۱۵. ویدیوها و بررسی‌ها (جادوی نیمورا) ══ -->
    <!-- <LazyVideoSlider /> -->

    <!-- ══ ۱۶. برندهای محبوب و معتبر ══ -->
    <LazyMainBrands />
  </div>
</template>

<script setup lang="ts">
import { createSlug } from '@nimoura/utils';
import type { ProductTab } from '~/components/Utils/ProductSliderTabs.vue';

const { categories } = useCategories();

function findCategoryNode(idOrName: number | string): { id: number; name: string; slug: string } | null {
  const stack = [...(categories.value ?? [])];
  while (stack.length) {
    const node = stack.shift()!;
    if (typeof idOrName === 'number' && node.id === idOrName) {
      return node;
    }
    if (typeof idOrName === 'string' && (node.name?.trim() === idOrName.trim() || node.slug === idOrName.trim())) {
      return node;
    }
    if (node.children?.length) {
      stack.push(...node.children);
    }
  }
  return null;
}

function categoryHref(id: number, fallbackName: string): string {
  const match = findCategoryNode(fallbackName) ?? findCategoryNode(id);
  if (match?.slug) {
    return `/categories/${encodeURIComponent(match.slug)}`;
  }
  return `/categories/${id}/${createSlug(fallbackName)}`;
}

function categoryEndpoint(name: string, fallbackId: number): string {
  const match = findCategoryNode(name) ?? findCategoryNode(fallbackId);
  const resolvedId = match?.id ?? fallbackId;
  return `/api/products/category?categoryId=${resolvedId}&limit=15`;
}

// تب‌های دسته‌بندی‌های آرایشی و زیبایی برای ProductSliderTabs
const beautyTabs = computed<ProductTab[]>(() => [
  {
    id: 'cosmetics',
    label: 'لوازم آرایشی',
    endpoint: categoryEndpoint('لوازم آرایشی', 1),
    href: categoryHref(1, 'لوازم آرایشی'),
  },
  {
    id: 'eye-makeup',
    label: 'آرایش چشم و مژه',
    endpoint: categoryEndpoint('آرایش چشم', 2),
    href: categoryHref(2, 'آرایش چشم'),
  },
  {
    id: 'skincare',
    label: 'مراقبت از پوست',
    endpoint: categoryEndpoint('مراقبت پوستی', 4),
    href: categoryHref(4, 'مراقبت پوستی'),
  },
  {
    id: 'haircare',
    label: 'مراقبت و سلامت مو',
    endpoint: categoryEndpoint('مراقبت از مو', 5),
    href: categoryHref(5, 'مراقبت از مو'),
  },
]);

const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.shop';

useSeoMeta({
  title: 'فروشگاه لوازم آرایشی و زیبایی نیمورا | خرید آنلاین با ضمانت اصالت',
  description:
    'خرید انواع لوازم آرایشی، مراقبت پوستی و زیبایی از برندهای معتبر جهانی با ضمانت اصالت کالا، بهترین قیمت و ارسال سریع در فروشگاه اینترنتی نیمورا.',
  ogTitle: 'فروشگاه لوازم آرایشی و بهداشتی نیمورا',
  ogDescription:
    'خرید اینترنتی محصولات آرایشی، پوستی و مراقبتی با بالاترین کیفیت و تضمین اصالت.',
  ogImage: `${siteUrl}/og-image.webp`,
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