<template>
  <div>
    <MainBannerHeader />
    <Shop3dEntry variant="hero" source="home" />
    <!-- <Shop3dEntry variant="link" source="product" :product="product.slug" /> -->
    <Shop3dEntry variant="link" source="category" zone="makeup" label="برو به بخش آرایش در مغازه" />
    <!-- :href="`/categories/1/${createSlug('لوازم آرایشی')}`" -->
    <LazyUtilsProductSlider
      title="لوازم"
      sub-title="آرایشی"
      description="زیبایی رو از نیمورا بخواه"
      endpoint="/api/products/category?categoryId=1&limit=15"
      :href="`/categories/1/${createSlug('لوازم آرایشی')}`"
    />

    <!-- <LazyMainCategory /> -->

    <LazyMainAmazingSlider />



    <LazyUtilsProductSlider
      title="جدید ترین"
      sub-title="محصولات"
      description="جدیدترین و بروزترین محصولات"
      endpoint="/api/products/list?sort=createdAt&limit=15"
      href="/tags/new-products?sort=createdAt"
    />

    <!-- <LazyClientOnly>
      <LazyMainBanner :banners="bannersGroup1" />
      <template #fallback>
        <SkeletonLoadingMiddleBanner />
      </template>
    </LazyClientOnly> -->

     <LazyVideoSlider />

    <LazyUtilsProductSlider
      title="پر فروش ترین"
      sub-title="محصولات"
      description="پر فروش بین همه"
      href="/tags/best-seller?sort=averageRating"
      endpoint="/api/products/list?sortBy=averageRating&limit=15"
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
      :href="`/categories/4/${createSlug('مراقبت پوستی')}`"
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
// const { data: bannersData }: any = await useFetch("/api/banners/list", {
//   query: {
//     position: "MAIN_PAGE_MIDDLE",
//     sortOrder: "ASC",
//   },
// });

// const formattedBanners = computed(() =>
//   bannersData.value.data.banners.map((banner: any) => ({
//     link: banner.category
//       ? `/categories/${banner.category.id}/${createSlug(banner.category.name)}`
//       : `/brand/${createSlug(banner.brand.name)}?id=${banner.brand.id}`,
//     image: banner.images[0]?.url || "",
//     alt: banner.title,
//   }))
// );

// const bannersGroup1 = computed(() => formattedBanners.value.slice(0, 2));
// const bannersGroup2 = computed(() => formattedBanners.value.slice(2, 4));
// const bannersGroup3 = computed(() => formattedBanners.value.slice(4, 6));
</script>
