<template>
  <main class="container pb-24 lg:pb-0">
    <!-- اسکلتون تمام‌صفحه هنگام لود کلاینت (بدون پرش چیدمان) -->
    <ProductDetailSinglePageSkeleton v-if="isPending && !resolvedProduct" />

    <Transition
      v-else-if="resolvedProduct"
      appear
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
    >
      <div>
        <!-- Breadcrumb -->
        <UtilsBreadCrumb :items="breadcrumbItems" />

        <!-- PRODUCT DETAILS SECTION -->
        <section
          class="mt-2.5 flex flex-col lg:flex-row items-start gap-4"
        >
          <!-- IMAGE & INFO BOX Container -->
          <ProductDetailSingleInfo
            :product="resolvedProduct"
            :Totalcomments="resolvedProduct.ratingsCount ?? 0"
            v-model:selectedVariant="selectedVariant"
            class="rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_6px_24px_rgba(39,33,33,0.04)] sm:p-5"
          />

          <!-- PRICE & ADD TO CART BOX (Desktop + Mobile Sticky Bar) -->
          <ProductDetailSinglePriceBox
            :product="resolvedProduct"
            :selectedVariant="selectedVariant"
          />
        </section>

        <LazyUtilsProductSlider
          v-if="resolvedProduct?.id"
          title="محصولات"
          sub-title="مشابه"
          :endpoint="`/api/products/similar?id=${resolvedProduct.id}`"
          :dontShowBtnAll="true"
          :hide-when-empty="true"
          class="mt-5"
        />

        <section class="mt-10 flex flex-col lg:flex-row items-start gap-4">
          <!-- ===== ستون محتوا ===== -->
          <main class="flex flex-col items-start gap-4 w-full lg:flex-1 min-w-0">
            <UtilsComponentCard
              v-if="resolvedProduct.introduce"
              title="معرفی"
              class="w-full"
            >
              <div
                class="relative overflow-hidden transition-all duration-500 ease-in-out"
                :style="{ maxHeight: showMore ? contentHeight + 'px' : '96px' }"
              >
                <div
                  ref="contentRef"
                  v-html="resolvedProduct.introduce"
                  class="product-rich-text leading-relaxed text-nimoura-text-700 text-sm"
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

            <ProductDetailSingleSpecifications
              v-if="resolvedProduct.specifications?.length"
              :specs="resolvedProduct.specifications"
            />

            <ClientOnly v-if="resolvedProduct.howToUse">
              <Accordion class="rounded-2xl! border! w-full overflow-hidden! border-gray-200!">
                <AccordionPanel value="0">
                  <AccordionHeader
                    class="!text-nimoura-text-700 !hover:text-nimoura-text-700"
                  >
                    نحوه مصرف
                  </AccordionHeader>

                  <AccordionContent>
                    <div
                      v-html="resolvedProduct.howToUse"
                      class="product-rich-text text-nimoura-text-700 text-sm leading-relaxed"
                    />
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </ClientOnly>

            <LazyUtilsProductSlider
              v-if="resolvedProduct.brand"
              title="از"
              sub-title="همین برند"
              :endpoint="`/api/products/related?id=${resolvedProduct.id}`"
              :dontShowBtnAll="true"
              :hide-when-empty="true"
            />

            <ProductDetailSingleReviews
              :product="resolvedProduct"
              :buyer-photos="19"
            />
          </main>

          <!-- ===== کارت محصول sticky — فقط دسکتاپ ===== -->
          <ProductDetailSingleAsidePrice
            :product="resolvedProduct"
            :selected-variant="selectedVariant"
            v-model:selectedVariant="selectedVariant"
          />
        </section>
      </div>
    </Transition>

    <UtilsEmptyState
      v-else
      :primary="{ label: 'بازگشت به صفحه اصلی', to: '/' }"
      title="محصول مورد نظر یافت نشد."
      description="ممکن است این محصول حذف شده باشد یا آدرس آن تغییر کرده باشد."
      icon="pi pi-box"
      class="my-12"
    />
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

const props = defineProps<{
  productData?: any;
  pending?: boolean;
}>();

const route = useRoute();

// اگر از صفحه والد محصول پاس داده نشده باشد، بر اساس slug یا id فچ کن
const shouldSelfFetch = computed(
  () => props.productData === undefined && props.pending === undefined,
);
const targetIdentifier = computed(() => route.params.slug || route.params.id);
const { data: fetchedProduct, pending: selfPending }: any = shouldSelfFetch.value
  ? await useFetch(() => `/api/products/${encodeURIComponent(String(targetIdentifier.value || ''))}`)
  : { data: ref(null), pending: ref(false) };

const resolvedProduct = computed(
  () => props.productData ?? fetchedProduct.value?.data ?? null,
);

const isPending = computed(() =>
  props.pending !== undefined ? props.pending : selfPending.value,
);

const breadcrumbItems = computed(() =>
  resolvedProduct.value
    ? buildCategoryBreadcrumb(resolvedProduct.value.category, "/categories", {
        currentLabel: resolvedProduct.value.title,
      })
    : [],
);

// ── State ─────────────────────────────────────
const showMore = ref(false);
const selectedVariant = ref<Variant | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const contentHeight = ref(500);

// ── Auto-select first in-stock variant ────────
watch(
  () => resolvedProduct.value?.variants,
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

<style scoped>
.product-rich-text :deep(h2) {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.7;
  color: var(--color-nimoura-text-800);
}

.product-rich-text :deep(h3),
.product-rich-text :deep(h4) {
  margin-top: 1rem;
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.7;
  color: var(--color-nimoura-text-800);
}

.product-rich-text :deep(p) {
  margin-bottom: 0.75rem;
  text-align: justify;
}

.product-rich-text :deep(p:last-child) {
  margin-bottom: 0;
}

.product-rich-text :deep(ul),
.product-rich-text :deep(ol) {
  margin-bottom: 0.75rem;
  padding-inline-start: 1.25rem;
}

.product-rich-text :deep(ul) {
  list-style-type: disc;
}

.product-rich-text :deep(ol) {
  list-style-type: decimal;
}

.product-rich-text :deep(li) {
  margin-bottom: 0.35rem;
  line-height: 1.8;
}

.product-rich-text :deep(strong) {
  font-weight: 600;
  color: var(--color-nimoura-text-800);
}

.product-rich-text :deep(blockquote) {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  border-inline-start: 3px solid var(--color-nimoura-primary);
  background-color: var(--color-nimoura-base);
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.product-rich-text :deep(blockquote p) {
  margin-bottom: 0;
}
</style>
