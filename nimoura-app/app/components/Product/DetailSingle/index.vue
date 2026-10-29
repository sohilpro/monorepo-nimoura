<template>
  <!-- <UtilsnimouraLoading v-if="pending && commentPending" /> -->
  <main class="container">
    <!-- Breadcrumb -->
    <UtilsBreadCrumb :items="breadcrumbItems" />
    <template v-if="pending">
      <div class="mt-5 flex flex-col lg:flex-row gap-4 animate-pulse">
        <!-- Info skeleton -->
        <div
          class="flex-1 rounded-lg bg-white shadow p-4 flex flex-col md:flex-row gap-4"
        >
          <div class="w-full md:w-1/2 aspect-square rounded-xl bg-gray-100" />
          <div class="flex-1 space-y-3 pt-2">
            <div class="h-3 w-20 rounded-full bg-gray-100" />
            <div class="h-5 w-3/4 rounded-full bg-gray-100" />
            <div class="h-3 w-1/3 rounded-full bg-gray-100" />
            <div class="h-3 w-full rounded-full bg-gray-100" />
            <div class="h-3 w-5/6 rounded-full bg-gray-100" />
            <div class="flex gap-2 mt-4">
              <div
                v-for="n in 3"
                :key="n"
                class="w-8 h-8 rounded-full bg-gray-100"
              />
            </div>
          </div>
        </div>
        <!-- Price skeleton -->
        <div
          class="hidden lg:flex lg:w-[280px] flex-col gap-4 rounded-lg bg-white shadow p-4"
        >
          <div class="w-full aspect-[4/3] rounded-xl bg-gray-100" />
          <div class="h-4 w-24 rounded-full bg-gray-100" />
          <div class="h-6 w-32 rounded-full bg-gray-100" />
          <div class="h-10 w-full rounded-xl bg-gray-100" />
          <div class="h-9 w-full rounded-xl bg-gray-100" />
        </div>
      </div>
    </template>

    <!-- PRODUCT DETAILS SECTION -->
    <section
      v-else-if="product?.data"
      class="mt-2.5 flex flex-col lg:flex-row items-start gap-4 *:rounded-lg *:bg-white *:shadow *:p-4"
    >
      <!-- IMAGE & INFO BOX Container -->
      <ProductDetailSingleInfo
        :product="product.data"
        :Totalcomments="0"
        v-model:selectedVariant="selectedVariant"
      />

      <!-- PRICE & ADD TO CART BOX -->
      <ProductDetailSinglePriceBox
        v-if="product"
        :product="product.data"
        :selectedVariant="selectedVariant"
      />
    </section>

    <LazyUtilsProductSlider
      title="محصولات"
      sub-title="مشابه"
      :endpoint="`/api/products/similar?id=${route.params.id}`"
      :dontShowBtnAll="true"
      class="mt-5"
    />

    <section class="mt-10 flex flex-col lg:flex-row items-start gap-4">
      <!-- ===== ستون محتوا ===== -->
      <main class="flex flex-col items-start gap-4 w-full lg:flex-1 min-w-0">
        <UtilsComponentCard title="معرفی" class="w-full">
          <div
            class="relative overflow-hidden transition-all duration-500 ease-in-out"
            :style="{ maxHeight: showMore ? contentHeight + 'px' : '96px' }"
          >
            <div
              ref="contentRef"
              v-html="product?.data.introduce"
              class="leading-relaxed text-nimoura-text-700 text-sm"
            />
            <div
              class="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-white pointer-events-none transition-opacity duration-300"
              :class="showMore ? 'opacity-0' : 'opacity-100'"
            />
          </div>
          <button
            class="text-nimoura-primary gap-1 font-medium flex items-center mt-2 text-sm"
            @click="showMore = !showMore"
          >
            {{ showMore ? "بستن" : "بیشتر" }}
            <i
              class="pi pi-chevron-left text-xs transition-transform duration-300"
              :class="showMore ? 'rotate-90' : '-rotate-90'"
            />
          </button>
        </UtilsComponentCard>

        <!-- <UtilsComponentCard title="مشخصات" class="w-full"> -->
          <ProductDetailSingleSpecifications
            :specs="product?.data.specifications || []"
          />
        <!-- </UtilsComponentCard> -->

        <ClientOnly>
          <Accordion class="rounded-2xl! border! w-full overflow-hidden! border-gray-200!">
            <AccordionPanel  value="0">
              <AccordionHeader
                class="!text-nimoura-text-700 !hover:text-nimoura-text-700"
              >
                نحوه مصرف
              </AccordionHeader>

              <AccordionContent>
                <p
                  v-html="product?.data.howToUse"
                  class="text-nimoura-text-700 text-sm leading-relaxed"
                />
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </ClientOnly>

        <LazyUtilsProductSlider
          title="از"
          sub-title="همین برند"
          :endpoint="`/api/products/related?id=${route.params.id}`"
          :dontShowBtnAll="true"
        />

        <ProductDetailSingleReviews
          :product="product.data"
          :buyer-photos="19"
        />
      </main>

      <!-- ===== کارت محصول sticky — فقط دسکتاپ ===== -->
      <ProductDetailSingleAsidePrice
        :product="product.data"
        :selected-variant="selectedVariant"
        v-model:selectedVariant="selectedVariant"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
interface Variant {
  id: number;
  value: string;
  alt: string;
  price: number;
  stock: number;
}

const route = useRoute();

// ── Data ──────────────────────────────────────
const { data: product, pending }: any = await useFetch(
  "/api/products/findOne",
  {
    query: { id: route.params.id },
  },
);

const breadcrumbItems = computed(() =>
  product.value?.data?.category
    ? buildCategoryBreadcrumb(product.value.data.category)
    : [],
);

// ── State ─────────────────────────────────────
const showMore = ref(false);
const selectedVariant = ref<Variant | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const contentHeight = ref(500);

// ── Rating distribution (computed from product) ──
const ratingDistribution = computed(() => {
  // اگه بکند این داده رو ندی، اینجا placeholder میسازیم
  return [5, 4, 3, 2, 1].map((s) => ({ star: s, count: 0, percent: 0 }));
});

// ── Auto-select first in-stock variant ────────
watch(
  () => product.value?.data?.variants,
  (variants) => {
    if (variants?.length && !selectedVariant.value) {
      selectedVariant.value =
        variants.find((v: Variant) => v.stock > 0) ?? null;
    }
  },
  { immediate: true },
);

onMounted(() => {
  contentHeight.value = contentRef.value?.scrollHeight ?? 500;
});
</script>
