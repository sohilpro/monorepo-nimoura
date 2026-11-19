<template>
  <section>
    <Categories v-if="query" />

    <main v-else class="container py-8">
      <UtilsBreadCrumb
        :items="[
          { label: 'خانه', href: '/' },
          { label: 'جستجوی محصولات' },
        ]"
      />
      <UtilsEmptyState
        title="جستجوی محصولات"
        description="نام محصول، برند یا ویژگی موردنظر خود را جستجو کنید."
        icon="pi pi-search"
        :primary="{ label: 'بازگشت به فروشگاه', to: '/' }"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || "https://nimoura.shop";
const query = computed(() => String(route.query.q ?? "").trim());
const pageTitle = computed(() =>
  query.value
    ? `جستجوی «${query.value}» | فروشگاه نیمورا`
    : "جستجوی محصولات | فروشگاه نیمورا",
);
const pageDescription = computed(() =>
  query.value
    ? `نتایج جستجوی ${query.value} در فروشگاه اینترنتی نیمورا؛ مشاهده و خرید محصولات آرایشی و مراقبتی.`
    : "جستجو و خرید محصولات آرایشی و مراقبتی از فروشگاه اینترنتی نیمورا.",
);


definePageMeta({
  key: (currentRoute) => currentRoute.fullPath,
});

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: "website",
  twitterCard: "summary_large_image",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: computed(() => `${siteUrl}/search${query.value ? `?q=${encodeURIComponent(query.value)}` : ""}`),
    },
  ],
  script: [
    {
      type: "application/json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: pageTitle.value,
          description: pageDescription.value,
          url: `${siteUrl}/search${query.value ? `?q=${encodeURIComponent(query.value)}` : ""}`,
          isPartOf: {
            "@type": "WebSite",
            name: "Nimoura",
            url: siteUrl,
          },
        }),
      ),
    },
  ],
});
</script>
