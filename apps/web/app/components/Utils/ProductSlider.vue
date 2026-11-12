<template>
  <section
    v-if="!hideWhenEmpty || !hasFetched || pending || products.length > 0"
    ref="sectionRef"
    :class="[!dontShowBtnAll ? ' lg:container mt-10 lg:mt-20' : 'w-full']"
  >
    <!-- SECTION TITLE -->
    <div
      class="flex gap-y-5 xs:flex-row xs:items-center justify-between w-full text-start"
    >
      <!-- عنوان و توضیحات -->
      <div
        class="flex mr-4 md:items-center md:justify-center gap-x-3 justify-start sm:gap-x-4"
      >
        <span
          class="hidden xs:flex size-11 sm:size-12 lg:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 ring-1 ring-nimoura-primary/10"
        >
          <i
            class="pi pi-objects-column text-lg! sm:text-xl! lg:text-2xl! text-nimoura-primary!"
          />
        </span>

        <div class="space-y-0.5 sm:space-y-1">
          <h3
            class="text-lg sm:text-xl lg:text-2xl font-modam font-medium leading-snug text-nimoura-text-700"
          >
            {{ title }}
            <span class="text-nimoura-primary">{{ subTitle }}</span>
          </h3>
          <p
            class="text-xs sm:text-sm text-nimoura-text-500 line-clamp-1 sm:line-clamp-none"
          >
            {{ description }}
          </p>
        </div>
      </div>

      <!-- دکمه‌ی مشاهده همه -->
      <div
        v-if="!dontShowBtnAll && !pending"
        class="flex justify-center ml-4 xs:justify-end shrink-0"
      >
        <NuxtLink
          :to="href || '/'"
          class="group shadow-xl text-sm md:text-base flex items-center gap-x-1 md:gap-x-1.5 px-3 sm:px-2 md:px-3 h-9 sm:h-10 text-white bg-nimoura-primary rounded-xl transition-transform active:scale-95"
        >
          <span class="flex gap-1 whitespace-nowrap">
            <span class="hidden lg:inline">مشاهده</span> همه
          </span>
          <span
            class="size-6 sm:size-7 rounded-full flex-center md:group-hover:-translate-x-1 transition-transform duration-300"
          >
            <i class="pi pi-arrow-left text-base sm:text-lg lg:text-xl"></i>
          </span>
        </NuxtLink>
      </div>
    </div>

    <div class="relative px-6 w-full mt-5">
      <!-- خالی/خطا -->
      <p
        v-if="!pending && hasFetched && products.length === 0"
        class="text-center text-sm text-nimoura-text-400 py-8"
      >
        محصولی برای نمایش یافت نشد.
      </p>

      <!-- Viewport -->
      <div v-else ref="emblaRef" class="overflow-hidden">
        <div class="flex gap-2.5 sm:gap-3 touch-pan-y">
          <!-- اسکلتون: کپی دقیق ابعاد و چیدمان ProductCard با PrimeVue -->
          <template v-if="pending || !hasFetched">
            <div
              v-for="n in skeletonCount"
              :key="`skeleton-${n}`"
              class="flex-none min-w-0"
            >
              <ProductCardSkeleton />
            </div>
          </template>

          <div
            v-for="product in products"
            :key="product.id"
            class="flex-none w-[148px] min-w-0"
          >
            <ProductCard :product />
          </div>
        </div>
      </div>

      <!-- دکمه راست (قبلی در RTL) -->
      <button
        class="absolute hidden right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md lg:flex items-center justify-center transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg"
        v-show="!pending && canScrollPrev"
        @click="scrollPrev"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <!-- دکمه چپ (بعدی در RTL) -->
      <button
        class="absolute hidden left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md lg:flex items-center justify-center transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg"
        v-show="!pending && canScrollNext"
        @click="scrollNext"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";

const { description, subTitle, title, query, href, endpoint, dontShowBtnAll, limit, hideWhenEmpty } =
  defineProps<{
    title?: string;
    subTitle?: string;
    description?: string;
    href?: string;
    query?: string | any;
    endpoint?: string;
    dontShowBtnAll?: boolean;
    limit?: number;
    hideWhenEmpty?: boolean;
  }>();

// -------------------- Embla --------------------
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: false,
  align: "start",
  dragFree: true,
  containScroll: "trimSnaps",
  direction: "rtl",
});

const canScrollPrev = ref(false);
const canScrollNext = ref(true);
const selectedIndex = ref(0);

function syncScrollState() {
  const api = emblaApi.value;
  if (!api) return;
  canScrollPrev.value = api.canScrollPrev();
  canScrollNext.value = api.canScrollNext();
}

watch(emblaApi, (api) => {
  if (!api) return;
  syncScrollState();
  api.on("select", () => {
    selectedIndex.value = api.selectedScrollSnap();
    syncScrollState();
  });
});

const scrollPrev = () => emblaApi.value?.scrollPrev();
const scrollNext = () => emblaApi.value?.scrollNext();

// -------------------- Fetch محصولات --------------------
const resolvedEndpoint = computed(() => {
  if (endpoint) return endpoint;
  if (href) {
    const [path] = href.split("?");
    const qs = typeof query === "string" ? query : "";
    return `/api${path}${qs ? `?${qs}` : ""}`;
  }
  return null;
});

const skeletonCount = computed(() => {
  if (typeof limit === "number" && limit > 0) return limit;
  if (typeof query === "object" && query !== null && Number(query.limit) > 0) {
    return Math.trunc(Number(query.limit));
  }
  const endpointStr = resolvedEndpoint.value;
  if (endpointStr) {
    const qIndex = endpointStr.indexOf("?");
    if (qIndex !== -1) {
      const params = new URLSearchParams(endpointStr.slice(qIndex + 1));
      const parsed = Number(params.get("limit"));
      if (Number.isFinite(parsed) && parsed > 0) return Math.trunc(parsed);
    }
  }
  return 8;
});

const rawResponse = ref<any>(null);
const pending = ref(false);
const hasFetched = ref(false);

const products = computed<any[]>(() => {
  const res = rawResponse.value;
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.products)) return res.data.products;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.products)) return res.products;
  return [];
});

async function fetchProducts() {
  if (!resolvedEndpoint.value || hasFetched.value) return;
  pending.value = true;
  try {
    rawResponse.value = await $fetch(resolvedEndpoint.value);
  } catch (e) {
    rawResponse.value = null;
  } finally {
    pending.value = false;
    hasFetched.value = true;
    await nextTick();
    emblaApi.value?.reInit();
    syncScrollState();
  }
}

const sectionRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value || !resolvedEndpoint.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        fetchProducts();
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
