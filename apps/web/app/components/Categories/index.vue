<template>
  <!-- لودینگ اولیه‌ی صفحه: به‌جای اسپینر تمام‌صفحه، اسکلتون هم‌شکل چیدمان واقعی -->
  <main v-if="pending && !products" class="container">
    <div class="mt-4 flex flex-col gap-4 lg:mt-5 lg:flex-row lg:gap-5">
      <div class="hidden lg:block lg:w-1/4">
        <Skeleton width="100%" height="26rem" border-radius="1rem" />
      </div>
      <div class="min-w-0 lg:w-3/4">
        <div class="mb-5 hidden items-center justify-between lg:flex">
          <Skeleton width="9rem" height="2rem" border-radius="0.75rem" />
          <Skeleton width="5rem" height="1.25rem" />
        </div>
        <CategoriesUtilsProductGridSkeleton :count="10" />
      </div>
    </div>
  </main>

  <main v-else class="container">
    <UtilsBreadCrumb v-if="hasProducts" :items="breadcrumbItems" />

    <div
      v-if="hasProducts || hasActiveFilters"
      class="mt-4 flex flex-col gap-4 lg:mt-5 lg:flex-row lg:gap-5"
    >
      <!-- SIDE FILTER BOX (desktop) -->
      <CategoriesUtilsSideFilterBox
        :key="resetKey"
        :clear-filters="clearFilters"
        :facets="facets"
      />

      <!-- Mobile filter/sort overlay backdrop -->
      <div
        v-show="sortModal || filterModal"
        class="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity lg:hidden"
        @click="handleOverlay"
      />

      <!-- PRODUCTS COLUMN -->
      <div class="min-w-0 lg:w-3/4">
        <!-- MOBILE FILTER BAR -->
        <div class="flex mb-2 flex-wrap items-center gap-2 lg:hidden">
          <button
            type="button"
            class="sort-modal-open flex shrink-0 items-center gap-x-1 rounded-full border border-nimoura-border/40 px-3 py-1.5 text-xs text-nimoura-text-700 sm:text-sm"
            @click="sortModal = true"
          >
            <i class="pi pi-sort text-sm!" />
            <span>{{ currentSortLabel }}</span>
          </button>

          <ClientOnly>
            <CategoriesUtilsSortModal
              :visible="sortModal"
              :close="handleOverlay"
              :clear-filters="clearFilters"
            />
          </ClientOnly>

          <button
            type="button"
            class="filter-modal-open flex shrink-0 items-center gap-x-1 rounded-full border border-nimoura-border/40 px-3 py-1.5 text-xs text-nimoura-text-700 sm:text-sm"
            @click="filterModal = true"
          >
            <i class="pi pi-filter text-sm!" />
            <span>فیلتر</span>
            <span
              v-if="activeFilterCount"
              class="rounded-full bg-nimoura-primary px-1.5 text-[10px] leading-4 text-white"
            >
              {{ numberFormat(activeFilterCount) }}
            </span>
          </button>

          <ClientOnly>
            <CategoriesUtilsFilterModal
              :visible="filterModal"
              :close="handleOverlay"
              :clear-filters="clearFilters"
              :facets="facets"
            />
          </ClientOnly>

          <span
            class="ms-auto shrink-0 py-1.5 text-xs text-nimoura-text-400 font-modam sm:text-sm"
          >
            {{ numberFormat(totalCount) }}
            <span class="font-vazir">کالا</span>
          </span>
        </div>

        <!--
          DESKTOP FILTER BAR
          sticky می‌شه تا موقع اسکرول به سمت پایین، همیشه در دسترس بمونه.
          مقدار lg:top-4 رو اگه یه هدر sticky سراسری داری، با ارتفاع همون
          هدر جایگزین کن (مثلاً lg:top-20) تا زیرش بچسبه نه روش.
        -->
        <div
          class="mb-5 hidden items-center justify-between gap-4 rounded-xl lg:sticky lg:top-4 lg:z-20 lg:flex lg:bg-white/90 lg:py-2 lg:backdrop-blur xl:mb-6"
        >
          <CategoriesUtilsSortedBy
            :options="sortOptions"
            :current-sort="currentSort"
            @update:sort="handleSortChange"
          />
          <span class="shrink-0 ml-5 text-sm text-nimoura-text-400 font-modam">
            {{ numberFormat(totalCount) }}
            <span class="font-vazir">کالا</span>
          </span>
        </div>

        <!-- ACTIVE FILTER CHIPS -->
        <CategoriesUtilsActiveFilters
          :groups="facets?.groups ?? []"
          :clear-filters="clearFilters"
        />

        <!-- NO RESULT FOR THE CHOSEN FILTERS -->
        <UtilsEmptyState
          v-if="!displayProducts.length && !pending"
          :primary="{ label: 'حذف فیلترها' }"
          @primary="clearFilters"
          title="محصولی با این فیلترها پیدا نشد."
          description="یک یا چند فیلتر را بردارید تا نتایج بیشتری ببینید."
          icon="pi pi-filter-slash"
          class="mt-2"
        />

        <!-- PRODUCTS GRID -->
        <div
          class="grid grid-cols-2 gap-2 transition-opacity xs:gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 2xl:grid-cols-5"
          :class="{ 'pointer-events-none opacity-60': pending }"
        >
          <CategoriesUtilsProductItem :products="displayProducts" />
        </div>

        <!-- اسکلتون لود بیشتر (اسکرول) - هم موبایل هم دسکتاپ -->
        <CategoriesUtilsProductGridSkeleton
          v-if="isFetchingMore"
          :count="5"
          class="mt-3"
        />

        <!-- INFINITE SCROLL SENTINEL - هم موبایل هم دسکتاپ -->
        <div v-if="infiniteMode && !reachedEnd" ref="sentinel" class="h-1 w-full" />

        <p
          v-else-if="infiniteMode && reachedEnd && displayProducts.length"
          class="mt-6 text-center text-xs text-nimoura-text-400 sm:text-sm"
        >
          همه محصولات نمایش داده شد
        </p>

        <!-- PAGINATION (وقتی از تعداد صفحات auto-load عبور کردیم) -->
        <!-- <CategoriesUtilsPagination
          v-if="!infiniteMode"
          :total-pages="totalPages"
          :current-page="currentPage"
          @update:page="handlePageChange"
        /> -->
      </div>
    </div>

    <UtilsEmptyState
      v-else
      :primary="{ label: 'صفحه اصلی', to: '/' }"
      title="محصولی اکنون وجود ندارد."
      description="لطفا از قسمت های دیگر سایت بازدید کنید."
      icon="pi pi-asterisk"
      class="mt-5"
    />
  </main>

  <UtilsScrollToTop />
</template>

<script setup lang="ts">
// کلید صفحه رو به fullPath وصل می‌کنیم تا با تغییر id (یا هر بخشی از route)
// کل کامپوننت destroy/recreate بشه و هیچ state قدیمی (از جمله دیتای فچ‌شده) نمونه.
// این تنها راه تضمینی برای جلوگیری از "چسبیدن" دیتای دسته‌بندی قبلیه.
definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const router = useRouter();

const MAX_AUTO_PAGES = 3;
const PAGE_SIZE = 9;

// ─── UI state ─────────────────────────────────────────────
const resetKey = ref(0);
const sortModal = ref(false);
const filterModal = ref(false);

// ─── Query-derived state (این‌ها الان safe هستن چون با هر fullPath جدید
// کل کامپوننت از نو mount میشه و این مقادیر تازه محاسبه می‌شن) ───────────
const currentPage = ref(Number(route.query.page) || 1);
const currentSort = ref((route.query.sort as string) || "popular");
const id = route.params.id as string | undefined;

const sortOptions = [
  { label: "محبوب ترین", value: "popular" },
  { label: "پرفروش ترین", value: "bestseller" },
  { label: "جدید ترین", value: "latest" },
  { label: "ارزان ترین", value: "cheapest" },
  { label: "گران ترین", value: "expensive" },
];

const currentSortLabel = computed(
  () => sortOptions.find((o) => o.value === currentSort.value)?.label ?? "",
);

const isCategoryRoute = route.path.includes("/categories");
const apiUrl = isCategoryRoute ? "/api/products/category" : "/api/products/list";

function buildQuery(page: number) {
  return {
    ...route.query,
    limit: PAGE_SIZE,
    page,
    sort: currentSort.value,
    id,
  };
}

const fetchProducts = () => $fetch(apiUrl, { query: buildQuery(currentPage.value) });

// چون کل کامپوننت با تغییر route از نو ساخته میشه، کلید فچ فقط باید
// sort/page رو پوشش بده (id و فیلترها ثابتن در طول عمر این instance).
const apiKey = computed(
  () => `products-${route.fullPath}-${currentSort.value}-${currentPage.value}`,
);

const {
  data: products,
  pending,
}: any = useLazyAsyncData(apiKey, fetchProducts, {
  watch: [apiKey],
  // پی‌لود SSR قدیمی رو نادیده بگیر؛ همیشه دیتای تازه بگیر
  getCachedData: () => undefined,
});

// ─── Facets (tag groups with counts, price range) ─────────────
const { activeCount: activeFilterCount } = useProductFilters();
const hasActiveFilters = computed(() => activeFilterCount.value > 0);

const facetQuery = computed(() => {
  const { page: _page, sort: _sort, ...filters } = route.query;
  return { ...filters, id };
});

const { data: facetsResponse }: any = useLazyAsyncData(
  () => `facets-${route.fullPath}`,
  () => $fetch("/api/products/facets", { query: facetQuery.value }),
  { server: false, watch: [facetQuery], getCachedData: () => undefined },
);

const facets = computed(
  () => facetsResponse.value?.data ?? facetsResponse.value ?? null,
);

const totalPages = computed(() => products.value?.data?.totalPages ?? 1);
const totalCount = computed(() => products.value?.data?.total ?? 0);
const hasProducts = computed(
  () => (products.value?.data?.products?.length ?? 0) > 0,
);

const breadcrumbItems = computed(() =>
  products.value?.data?.category
    ? buildCategoryBreadcrumb(products.value.data.category)
    : [],
);

// ─── Infinite scroll (هم موبایل هم دسکتاپ) ──────────────────
const infiniteMode = ref(true);
const infinitePage = ref(1);
const isFetchingMore = ref(false);
const accumulatedProducts = ref<any[]>([]);
const sentinel = ref<HTMLElement | null>(null);

const reachedEnd = computed(() => infinitePage.value >= totalPages.value);

const displayProducts = computed(() => {
  if (!infiniteMode.value) return products.value?.data?.products ?? [];
  return accumulatedProducts.value;
});

watch(
  products,
  (val) => {
    if (infiniteMode.value && infinitePage.value === currentPage.value) {
      accumulatedProducts.value = val?.data?.products ?? [];
    }
  },
  { immediate: true },
);

async function loadMore() {
  if (!infiniteMode.value || isFetchingMore.value) return;
  if (infinitePage.value >= totalPages.value) return;

  if (infinitePage.value >= MAX_AUTO_PAGES) {
    infiniteMode.value = false;
    router.push({ query: { ...route.query, page: infinitePage.value } });
    return;
  }

  isFetchingMore.value = true;
  const nextPage = infinitePage.value + 1;

  try {
    const res: any = await $fetch(apiUrl, { query: buildQuery(nextPage) });
    accumulatedProducts.value.push(...(res?.data?.products ?? []));
    infinitePage.value = nextPage;
  } catch (err) {
    console.error("خطا در بارگذاری محصولات بیشتر:", err);
  } finally {
    isFetchingMore.value = false;
  }
}

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry?.isIntersecting) loadMore();
});

// ─── Sync state با تغییر query (sort/page/فیلتر) ──────────────
// توجه: تغییر id باعث remount کامل صفحه میشه (به‌خاطر definePageMeta.key)،
// پس اینجا دیگه لازم نیست idChanged رو دستی چک کنیم.
watch(
  () => JSON.stringify(route.query),
  (newQueryStr, oldQueryStr) => {
    currentPage.value = Number(route.query.page) || 1;
    currentSort.value = (route.query.sort as string) || "popular";
    sortModal.value = false;
    filterModal.value = false;

    const newQuery = JSON.parse(newQueryStr);
    const oldQuery = oldQueryStr ? JSON.parse(oldQueryStr) : {};
    const { page: _np, ...restNew } = newQuery;
    const { page: _op, ...restOld } = oldQuery;

    const filtersChanged = JSON.stringify(restNew) !== JSON.stringify(restOld);

    if (filtersChanged) {
      infiniteMode.value = true;
      infinitePage.value = 1;
      accumulatedProducts.value = [];
    }

     nextTick(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  },
);

function handlePageChange(page: number) {
  currentPage.value = page;
  router.push({ query: { ...route.query, page } });
  nextTick(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function handleSortChange(sort: string) {
  currentSort.value = sort;
  router.push({ query: { ...route.query, sort, page: 1 } });
}

function clearFilters() {
  const { sort } = route.query;
  router.push({
    path: route.path,
    query: sort ? { sort } : {},
  });
  resetKey.value += 1;
}

function handleOverlay() {
  sortModal.value = false;
  filterModal.value = false;
}
</script>