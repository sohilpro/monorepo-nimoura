<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";

interface AmazingProduct {
  id: number | string;
  title: string;
  slug?: string;
  price: number;
  priceDiscount: number;
  discountPercent?: number;
}

const sectionRef = ref<HTMLElement | null>(null);
const amazingProducts = ref<AmazingProduct[]>([]);
const pending = ref(true);
const hasFetched = ref(false);

// -------------------- Embla --------------------
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: false,
  align: "start",
  dragFree: true,
  direction: "rtl",
  containScroll: "trimSnaps",
});

const canScrollPrev = ref(false);
const canScrollNext = ref(false);

function syncScrollState() {
  const api = emblaApi.value;
  if (!api) return;
  canScrollPrev.value = api.canScrollPrev();
  canScrollNext.value = api.canScrollNext();
}

watch(emblaApi, (api) => {
  if (!api) return;
  syncScrollState();
  api.on("select", syncScrollState);
  api.on("reInit", syncScrollState);
});

const scrollPrev = () => emblaApi.value?.scrollPrev();
const scrollNext = () => emblaApi.value?.scrollNext();

// -------------------- Fetch --------------------
async function fetchAmazingProducts() {
  if (hasFetched.value) return;
  pending.value = true;

  try {
    const data: any = await $fetch("/api/products/amazing", {
      query: { limit: 10 },
    });
    amazingProducts.value = data?.data?.products ?? [];
  } catch {
    amazingProducts.value = [];
  } finally {
    pending.value = false;
    hasFetched.value = true;
    await nextTick();
    emblaApi.value?.reInit();
    syncScrollState();
  }
}

// -------------------- Scroll-triggered fetch --------------------
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        fetchAmazingProducts();
        observer?.disconnect();
        observer = null;
      }
    },
    { rootMargin: "200px 0px" },
  );

  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <section
    v-if="!hasFetched || pending || amazingProducts.length > 0"
    ref="sectionRef"
    class="mx-4 mt-14 lg:container lg:mt-20"
  >
    <div class="relative w-full rounded-2xl bg-nimoura-primary p-3.5 sm:p-4">
      <!-- هدر موبایل -->
      <div class="mb-3 flex items-center justify-between gap-2 lg:hidden">
        <div class="flex items-center gap-2.5">
          <IconsAmazingsMobile class="h-7 w-24 shrink-0" />
          <ProductCountdownTimer :days="1" />
        </div>

        <NuxtLink
          to="/products/amazing"
          class="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition-colors active:bg-white/25"
        >
          <span>همه</span>
          <i class="pi pi-chevron-left text-[10px]!" />
        </NuxtLink>
      </div>

      <!-- ویوپورت Embla -->
      <div class="relative">
        <div ref="emblaRef" class="overflow-hidden rounded-xl">
          <div class="flex gap-x-2.5 touch-pan-y">
            <!-- تایمر - فقط دسکتاپ -->
            <div
              class="hidden h-[220px] w-40 flex-none flex-col items-center justify-center gap-4 lg:flex"
            >
              <NuxtLink
                to="/products/amazing"
                aria-label="مشاهده پیشنهادات شگفت‌انگیز"
              >
                <IconsAmazings class="h-28 w-28" />
              </NuxtLink>
              <ProductCountdownTimer :days="1" />
            </div>

            <!-- اسکلتون -->
            <template v-if="pending || !hasFetched">
              <div
                v-for="i in 8"
                :key="`skeleton-${i}`"
                class="flex-none"
              >
                <ProductCardSkeleton />
              </div>
            </template>

            <!-- کارت‌های واقعی -->
            <template v-else>
              <ProductCard
                v-for="product in amazingProducts"
                :key="product.id"
                :product="product"
                class="flex-none"
              />

              <!-- مشاهده همه -->
              <div
                v-if="amazingProducts.length"
                class="flex flex-none flex-col items-center justify-center"
              >
                <NuxtLink
                  to="/products/amazing"
                  class="flex h-[220px] flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 text-center text-sm font-medium text-nimoura-primary transition-transform hover:scale-[0.98]"
                >
                  <i class="pi pi-arrow-circle-left text-4xl!" />
                  <span>مشاهده همه</span>
                </NuxtLink>
              </div>
            </template>
          </div>
        </div>

        <!-- دکمه‌های اسکرول دسکتاپ -->
        <button
          v-show="!pending && canScrollPrev"
          type="button"
          class="absolute -right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-nimoura-text-700 shadow-md transition-opacity hover:shadow-lg lg:flex"
          aria-label="اسلاید قبلی"
          @click="scrollPrev"
        >
          <i class="pi pi-chevron-right text-xs!" />
        </button>

        <button
          v-show="!pending && canScrollNext"
          type="button"
          class="absolute -left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-nimoura-text-700 shadow-md transition-opacity hover:shadow-lg lg:flex"
          aria-label="اسلاید بعدی"
          @click="scrollNext"
        >
          <i class="pi pi-chevron-left text-xs!" />
        </button>
      </div>
    </div>
  </section>
</template>
