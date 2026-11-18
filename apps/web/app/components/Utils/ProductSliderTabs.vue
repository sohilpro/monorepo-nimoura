<template>
  <section
    v-if="!hideWhenEmpty || !activeState.hasFetched || activeState.pending || activeState.products.length > 0"
    ref="sectionRef"
    :class="container ? 'lg:container mx-auto px-4' : 'w-full'"
    class="my-10 lg:my-16"
  >
    <!-- SECTION HEADER -->
    <div
      class="flex flex-col gap-y-4 w-full pb-4 border-b border-nimoura-text-100/70"
    >
      <div
        class="flex flex-col xs:flex-row xs:items-center justify-between gap-y-3"
      >
        <!-- TITLE & DESCRIPTION -->
        <div class="flex items-center gap-x-3.5">
          <!-- Icon Box -->
          <div
            class="hidden xs:flex size-11 sm:size-12 lg:size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 ring-1 ring-nimoura-primary/10 text-nimoura-primary shadow-xs"
          >
            <i :class="`pi ${icon || 'pi-sparkles'} text-lg sm:text-xl lg:text-2xl`" />
          </div>

          <div class="space-y-0.5 sm:space-y-1">
            <h3
              class="text-lg font-modam sm:text-xl lg:text-2xl font-bold leading-snug text-nimoura-text-800"
            >
              {{ title }}
              <span class="text-nimoura-primary">{{ subTitle }}</span>
            </h3>
            <p
              v-if="description"
              class="text-xs sm:text-sm text-nimoura-text-500 line-clamp-1 sm:line-clamp-none"
            >
              {{ description }}
            </p>
          </div>
        </div>

        <!-- VIEW ALL BUTTON (به تب فعال ارجاع می‌دهد) -->
        <div
          v-if="!dontShowBtnAll && activeTab?.href"
          class="flex justify-start xs:justify-end shrink-0"
        >
          <NuxtLink
            :to="activeTab.href"
            class="group text-xs sm:text-sm font-semibold flex items-center gap-x-1.5 px-3.5 h-9 sm:h-10 text-white bg-nimoura-primary hover:bg-nimoura-primary/90 rounded-xl shadow-xs transition-all duration-300 active:scale-95"
          >
            <span><span class="hidden lg:inline">مشاهده</span> همه</span>
            <i
              class="pi pi-arrow-left text-xs transition-transform duration-300 group-hover:-translate-x-1"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- TABS -->
      <div
        v-if="tabs?.length"
        class="flex items-center gap-x-2 overflow-x-auto no-scrollbar pt-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="selectTab(tab)"
          :class="[
            'shrink-0 px-4 h-9 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap',
            activeTabId === tab.id
              ? 'bg-nimoura-primary text-white shadow-xs'
              : 'bg-white text-nimoura-text-700 border border-nimoura-text-100 hover:border-nimoura-primary/40 hover:text-nimoura-primary',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- SLIDER CONTENT -->
    <div class="relative w-full mt-6 group/slider">
      <!-- EMPTY STATE -->
      <div
        v-if="
          !activeState.pending &&
          activeState.hasFetched &&
          activeState.products.length === 0
        "
        class="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-nimoura-text-100 text-center"
      >
        <i class="pi pi-inbox text-3xl text-nimoura-text-400 mb-2" />
        <p class="text-sm text-nimoura-text-500 font-medium">
          محصولی در این دسته‌بندی برای نمایش یافت نشد.
        </p>
      </div>

      <!-- VIEWPORT & CAROUSEL -->
      <div v-else ref="emblaRef" class="overflow-hidden rounded-2xl py-1">
        <div class="flex gap-2.5 sm:gap-3 touch-pan-y">
          <!-- SKELETON LOADERS -->
          <template v-if="activeState.pending || !activeState.hasFetched">
            <div
              v-for="n in 6"
              :key="`skeleton-${n}`"
              class="flex-none min-w-0"
            >
              <ProductCardSkeleton />
            </div>
          </template>

          <!-- PRODUCT CARDS -->
          <template v-else>
            <div
              v-for="product in activeState.products"
              :key="product.id"
              class="flex-none w-[148px] min-w-0"
            >
              <ProductCard :product="product" />
            </div>
          </template>
        </div>
      </div>

      <!-- PREV BUTTON (راست در RTL) -->
      <button
        class="absolute hidden lg:flex -right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white text-nimoura-text-800 border border-nimoura-border/60 shadow-md items-center justify-center transition-all duration-300 hover:bg-nimoura-primary hover:text-white hover:border-nimoura-primary disabled:opacity-0 disabled:pointer-events-none z-10"
        v-show="!activeState.pending && canScrollPrev"
        @click="scrollPrev"
        aria-label="قبلی"
      >
        <i class="pi pi-chevron-right text-xs" />
      </button>

      <!-- NEXT BUTTON (چپ در RTL) -->
      <button
        class="absolute hidden lg:flex -left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white text-nimoura-text-800 border border-nimoura-border/60 shadow-md items-center justify-center transition-all duration-300 hover:bg-nimoura-primary hover:text-white hover:border-nimoura-primary disabled:opacity-0 disabled:pointer-events-none z-10"
        v-show="!activeState.pending && canScrollNext"
        @click="scrollNext"
        aria-label="بعدی"
      >
        <i class="pi pi-chevron-left text-xs" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";

export interface ProductTab {
  id: string | number;
  label: string;
  href?: string;
  query?: string | any;
  endpoint?: string;
}

const { title, subTitle, description, icon, dontShowBtnAll, tabs, container, hideWhenEmpty } =
  defineProps<{
    title?: string;
    subTitle?: string;
    description?: string;
    icon?: string;
    dontShowBtnAll?: boolean;
    container?: boolean;
    hideWhenEmpty?: boolean;
    tabs: ProductTab[];
  }>();

type TabState = { products: any[]; pending: boolean; hasFetched: boolean };

const tabsState = reactive<Record<string | number, TabState>>(
  Object.fromEntries(
    (tabs || []).map((t) => [
      t.id,
      { products: [], pending: false, hasFetched: false } as TabState,
    ]),
  ),
);

const activeTabId = ref<string | number | undefined>(tabs?.[0]?.id);

const activeTab = computed<ProductTab | undefined>(() =>
  tabs?.find((t) => t.id === activeTabId.value),
);

const activeState = computed<TabState>(
  () =>
    tabsState[activeTabId.value as string | number] ?? {
      products: [],
      pending: false,
      hasFetched: false,
    },
);

function resolveEndpoint(tab: ProductTab): string | null {
  if (tab.endpoint) return tab.endpoint;
  if (tab.href) {
    const [path] = tab.href.split("?");
    const qs = typeof tab.query === "string" ? tab.query : "";
    return `${path}${qs ? `?${qs}` : ""}`;
  }
  return null;
}

function extractProducts(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.products)) return res.data.products;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.products)) return res.products;
  return [];
}

async function fetchTab(tab?: ProductTab) {
  if (!tab) return;
  const state = tabsState[tab.id];
  if (!state || state.hasFetched || state.pending) return;

  const endpoint = resolveEndpoint(tab);
  if (!endpoint) {
    state.hasFetched = true;
    return;
  }

  state.pending = true;
  try {
    const res = await $fetch(endpoint);
    state.products = extractProducts(res);
  } catch {
    state.products = [];
  } finally {
    state.pending = false;
    state.hasFetched = true;
    await nextTick();
    if (tab.id === activeTabId.value) {
      emblaApi.value?.reInit();
      syncScrollState();
    }
  }
}

function selectTab(tab: ProductTab) {
  if (tab.id === activeTabId.value) return;
  activeTabId.value = tab.id;

  fetchTab(tab);

  nextTick(() => {
    emblaApi.value?.reInit();
    emblaApi.value?.scrollTo(0);
    syncScrollState();
  });
}

const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: false,
  align: "start",
  dragFree: true,
  containScroll: "trimSnaps",
  direction: "rtl",
});

const canScrollPrev = ref(false);
const canScrollNext = ref(true);

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
});

const scrollPrev = () => emblaApi.value?.scrollPrev();
const scrollNext = () => emblaApi.value?.scrollNext();

const sectionRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        fetchTab(activeTab.value);
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
