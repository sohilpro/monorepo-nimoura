<template>
  <div>
    <!-- لودینگ اولیه‌ی صفحه با اسکلتون کامل (بدون پرش چیدمان) -->
    <CategoriesUtilsPageSkeleton
      v-if="pending && !products"
      :page-size="PAGE_SIZE"
    />

    <Transition
      v-else
      appear
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
    >
      <main class="container">
      <UtilsBreadCrumb v-if="breadcrumbItems.length > 1" :items="breadcrumbItems" />

      <component
        :is="hasH1InSeoText ? 'p' : 'h1'"
        v-if="pageHeading"
        class="mt-3 text-lg font-bold text-nimoura-text-800 sm:text-xl"
      >
        {{ pageHeading }}
      </component>

      <!-- SUB-BRAND CHIPS (فقط در صفحات برند دارای زیربرند) -->
      <nav
        v-if="isBrandRoute && activeBrand?.subBrands?.length"
        aria-label="زیربرندها"
        class="mt-3 flex flex-wrap items-center gap-2"
      >
        <NuxtLink
          :to="`/brand/${encodeURIComponent(activeBrand.slug || createSlug(activeBrand.name))}`"
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          :class="
            !activeBrand.subBrand
              ? 'border-nimoura-primary bg-nimoura-primary text-white'
              : 'border-nimoura-text-100 bg-white text-nimoura-text-600 hover:border-nimoura-primary/40 hover:text-nimoura-primary'
          "
        >
          همه محصولات
        </NuxtLink>
        <NuxtLink
          v-for="sb in activeBrand.subBrands"
          :key="sb.id"
          :to="`/brand/${encodeURIComponent(activeBrand.slug || createSlug(activeBrand.name))}/${encodeURIComponent(sb.slug || createSlug(sb.name))}`"
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          :class="
            activeBrand.subBrand?.id === sb.id
              ? 'border-nimoura-primary bg-nimoura-primary text-white'
              : 'border-nimoura-text-100 bg-white text-nimoura-text-600 hover:border-nimoura-primary/40 hover:text-nimoura-primary'
          "
        >
          {{ sb.name }}
        </NuxtLink>
      </nav>

      <div
        v-if="hasProducts || hasActiveFilters"
        class="mt-4 flex flex-col gap-4 lg:mt-5 lg:flex-row lg:gap-5"
      >
        <!-- SIDE FILTER BOX (desktop) -->
        <CategoriesUtilsSideFilterBox
          :key="resetKey"
          :clear-filters="clearFilters"
          :facets="facets"
          :facets-pending="facetsPending"
        />

        <!-- PRODUCTS COLUMN -->
        <div class="min-w-0 flex-1 lg:w-3/4">
          <!-- MOBILE FILTER BAR -->
          <div class="mb-2 flex flex-wrap items-center gap-2 lg:hidden">
            <Button
              :label="currentSortLabel"
              icon="pi pi-sort-alt"
              outlined
              rounded
              size="small"
              severity="secondary"
              class="sort-modal-open !border-nimoura-border/40 !bg-white !px-3 !py-1.5 !text-xs !text-nimoura-text-700 sm:!text-sm"
              @click="sortModal = true"
            />

            <ClientOnly>
              <CategoriesUtilsSortModal
                :visible="sortModal"
                :close="handleOverlay"
                :options="sortOptions"
                :current-sort="currentSort"
              />
            </ClientOnly>

            <Button
              outlined
              rounded
              size="small"
              severity="secondary"
              class="filter-modal-open !border-nimoura-border/40 !bg-white !px-3 !py-1.5 !text-xs !text-nimoura-text-700 sm:!text-sm"
              @click="filterModal = true"
            >
              <i class="pi pi-filter text-xs!" aria-hidden="true" />
              <span>فیلتر</span>
              <Badge
                v-if="activeFilterCount"
                :value="numberFormat(activeFilterCount)"
                size="small"
                class="!bg-nimoura-primary !text-white"
              />
            </Button>

            <ClientOnly>
              <CategoriesUtilsFilterModal
                :visible="filterModal"
                :close="handleOverlay"
                :clear-filters="clearFilters"
                :facets="facets"
                :facets-pending="facetsPending"
              />
            </ClientOnly>

            <span
              class="ms-auto shrink-0 py-1.5 font-modam text-xs text-nimoura-text-400 sm:text-sm"
            >
              {{ numberFormat(totalCount) }}
              <span class="font-vazir">کالا</span>
            </span>
          </div>

          <!--
            DESKTOP FILTER BAR
            sticky می‌شه تا موقع اسکرول به سمت پایین، همیشه در دسترس بمونه.
          -->
          <div
            class="mb-5 hidden items-center justify-between gap-4 rounded-xl lg:sticky lg:top-4 lg:z-20 lg:flex lg:bg-white/90 lg:py-2 lg:backdrop-blur xl:mb-6"
          >
            <CategoriesUtilsSortedBy
              :options="sortOptions"
              :current-sort="currentSort"
              @update:sort="handleSortChange"
            />
            <span class="me-5 shrink-0 font-modam text-sm text-nimoura-text-400">
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

          <!-- PRODUCTS LOADING (filter / sort change) -->
          <CategoriesUtilsProductGridSkeleton
            v-if="pending && !displayProducts.length"
            :count="PAGE_SIZE"
          />

          <!-- PRODUCTS GRID -->
          <div
            v-else-if="displayProducts.length"
            class="grid grid-cols-2 gap-2 transition-opacity duration-200 xs:gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 2xl:grid-cols-5"
            :class="{ 'pointer-events-none opacity-60': pending }"
          >
            <CategoriesUtilsProductItem :products="displayProducts" />
          </div>

          <!-- اسکلتون لود بیشتر (اسکرول) - هم موبایل هم دسکتاپ -->
          <CategoriesUtilsProductGridSkeleton
            v-if="isFetchingMore"
            :count="loadMoreSkeletonCount"
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

          <CategoriesUtilsPagination
            v-if="!infiniteMode"
            :total-pages="totalPages"
            :current-page="currentPage"
            @update:page="handlePageChange"
          />
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

      <CategoriesUtilsSeoSection :category="seoSectionTarget" />
      </main>
    </Transition>

    <UtilsScrollToTop />
  </div>
</template>

<script setup lang="ts">
import {
  buildBrandBreadcrumb,
  buildCategoryBreadcrumb,
  createSlug,
} from "@nimoura/utils";
import {
  STOREFRONT_SORT_OPTIONS,
  STOREFRONT_SORT_VALUES,
  type Brand,
  type Category,
  type StorefrontSort,
  type SubBrand,
} from "@nimoura/shared-types";

const props = defineProps<{
  categoryData?: Category | null;
  brandData?: (Brand & { subBrand?: SubBrand | null }) | null;
}>();

const route = useRoute();
const router = useRouter();

const MAX_AUTO_PAGES = 3;
const PAGE_SIZE = 9;

const isCategoryRoute = route.path.includes("/categories");
const isBrandRoute = route.path.includes("/brand");
const isAmazingRoute = route.path.includes("/amazing");
const isNewestRoute = route.path.includes("/products/newest");
const isBestSellerRoute = route.path.includes("/products/best-seller");

const defaultSort: StorefrontSort = isNewestRoute ? "newest" : "popular";

function normalizeSort(raw: unknown): StorefrontSort {
  if (raw === "latest" || raw === "createdAt") return "newest";
  if (raw === "bestseller") return "popular";
  if (
    typeof raw === "string" &&
    (STOREFRONT_SORT_VALUES as readonly string[]).includes(raw)
  ) {
    return raw as StorefrontSort;
  }
  return defaultSort;
}

// ─── UI state ─────────────────────────────────────────────
const resetKey = ref(0);
const sortModal = ref(false);
const filterModal = ref(false);

// ─── Query-derived state (این‌ها الان safe هستن چون با هر fullPath جدید
// کل کامپوننت از نو mount میشه و این مقادیر تازه محاسبه می‌شن) ───────────
const currentPage = ref(Number(route.query.page) || 1);
const currentSort = ref<StorefrontSort>(normalizeSort(route.query.sort));
const slug = route.params.slug as string | undefined;
const subSlug = route.params.subSlug as string | undefined;
const id = (route.params.id ?? route.query.id) as string | undefined;

const sortOptions = [...STOREFRONT_SORT_OPTIONS];

const currentSortLabel = computed(
  () => sortOptions.find((o) => o.value === currentSort.value)?.label ?? "",
);

const apiUrl = isCategoryRoute
  ? "/api/products/category"
  : isBrandRoute
    ? "/api/products/brand"
    : isAmazingRoute
      ? "/api/products/amazing"
      : "/api/products/list";

function buildQuery(page: number) {
  return {
    ...route.query,
    limit: PAGE_SIZE,
    page,
    sort: currentSort.value,
    ...(isCategoryRoute
      ? slug
        ? { slug }
        : id
          ? { id }
          : {}
      : isBrandRoute
        ? {
            ...(slug ? { slug } : id ? { id } : {}),
            ...(subSlug ? { subBrandSlug: subSlug } : {}),
          }
        : {}),
  };
}

const fetchProducts = () => $fetch(apiUrl, { query: buildQuery(currentPage.value) });

// چون کل کامپوننت با تغییر route از نو ساخته میشه، کلید فچ فقط باید
// sort/page رو پوشش بده (id و فیلترها ثابتن در طول عمر این instance).
const apiKey = computed(
  () => `products-${route.fullPath}-${currentSort.value}-${currentPage.value}`,
);

const productsAsync: any = useLazyAsyncData(apiKey, fetchProducts, {
  watch: [apiKey],
  // در لحظه hydration پی‌لود SSR را نگه دار تا mismatch رخ ندهد؛ در ناوبری بعدی تازه بگیر
  getCachedData: (key, nuxtApp) =>
    nuxtApp.isHydrating ? nuxtApp.payload.data[key] : undefined,
});

onServerPrefetch(async () => {
  await productsAsync;
});

const { data: products, pending } = productsAsync;

const activeCategory = computed<Category | null>(
  () => products.value?.data?.category ?? props.categoryData ?? null,
);

const activeBrand = computed<
  (Brand & { subBrand?: SubBrand | null; subBrands?: SubBrand[] }) | null
>(() => products.value?.data?.brand ?? props.brandData ?? null);

const pageHeading = computed(() => {
  if (isAmazingRoute) {
    return "پیشنهادات شگفت‌انگیز";
  }
  if (isNewestRoute) {
    return "جدیدترین محصولات";
  }
  if (isBestSellerRoute) {
    return "پرفروش‌ترین محصولات";
  }
  if (isBrandRoute && activeBrand.value) {
    return activeBrand.value.subBrand
      ? `${activeBrand.value.name} — ${activeBrand.value.subBrand.name}`
      : activeBrand.value.name;
  }
  return activeCategory.value?.name ?? "";
});

const seoSectionTarget = computed(() => {
  if (isBrandRoute && activeBrand.value?.description) {
    return {
      name: activeBrand.value.name,
      seoText: activeBrand.value.description,
    };
  }
  return activeCategory.value;
});

const hasH1InSeoText = computed(() =>
  /<h1[\s>]/i.test(seoSectionTarget.value?.seoText ?? ""),
);

// ─── Facets (tag groups with counts, price range) ─────────────
const { activeCount: activeFilterCount } = useProductFilters();
const hasActiveFilters = computed(() => activeFilterCount.value > 0);

const facetQuery = computed(() => {
  const { page: _page, sort: _sort, ...filters } = route.query;
  const resolvedCategoryId = activeCategory.value?.id;
  return {
    ...filters,
    ...(isCategoryRoute
      ? resolvedCategoryId
        ? { categoryId: resolvedCategoryId }
        : slug
          ? { categorySlug: slug }
          : id
            ? { id }
            : {}
      : {}),
    ...(isBrandRoute
      ? {
          ...(activeBrand.value?.id
            ? { brandId: activeBrand.value.id }
            : slug
              ? { brandSlug: slug }
              : id
                ? { brandId: id }
                : {}),
          ...(activeBrand.value?.subBrand?.id
            ? { subBrandId: activeBrand.value.subBrand.id }
            : subSlug
              ? { subBrandSlug: subSlug }
              : {}),
        }
      : {}),
    ...(isAmazingRoute ? { amazing: "true" } : {}),
  };
});

const { data: facetsResponse, pending: facetsPending }: any = useLazyAsyncData(
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

const breadcrumbItems = computed(() => {
  if (isAmazingRoute) {
    return [
      { label: "خانه", href: "/" },
      { label: "پیشنهادات شگفت‌انگیز" },
    ];
  }
  if (isNewestRoute) {
    return [
      { label: "خانه", href: "/" },
      { label: "جدیدترین محصولات" },
    ];
  }
  if (isBestSellerRoute) {
    return [
      { label: "خانه", href: "/" },
      { label: "پرفروش‌ترین محصولات" },
    ];
  }
  if (isBrandRoute && activeBrand.value) {
    return buildBrandBreadcrumb(activeBrand.value);
  }
  return activeCategory.value
    ? buildCategoryBreadcrumb(activeCategory.value)
    : [];
});

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

const loadMoreSkeletonCount = computed(() => {
  const remaining = totalCount.value - displayProducts.value.length;
  if (remaining > 0) return Math.min(PAGE_SIZE, remaining);
  return PAGE_SIZE;
});

const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || "https://nimoura.shop";

useHead({
  script: [
    {
      type: "application/ld+json",
      children: computed(() => {
        if (
          (!isCategoryRoute &&
            !isBrandRoute &&
            !isAmazingRoute &&
            !isNewestRoute &&
            !isBestSellerRoute) ||
          !displayProducts.value.length
        )
          return "{}";
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: displayProducts.value.slice(0, PAGE_SIZE).map((p: any, idx: number) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: p.title,
            url: `${siteUrl}/product/${encodeURIComponent(p.slug || createSlug(p.title))}`,
          })),
        });
      }),
    },
  ],
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
    currentSort.value = normalizeSort(route.query.sort);
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