<script setup lang="ts">
import type { Article, Category } from '~~/server/types/magazine';

const route = useRoute();
const router = useRouter();

// ── دادههای زنده مجله ──────────────────────────────────────────────
const { data: categoriesData } = useMagazineCategoriesTree();
const categories = computed<Category[]>(() => {
  const raw: any = categoriesData.value;
  const list = raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
});

// همان کلید و کوئری هدر صفحه اصلی مجله → Nuxt درخواست تکراری نمیزند
const { data: featuredData }: any = useFetch('/api/magazine/articles', {
  query: { featured: true, limit: 1, sort: 'latest' },
  key: 'magazine-hero',
});
const featured = computed<Article | undefined>(() => {
  const raw: any = featuredData.value;
  return raw?.data?.items?.[0] ?? raw?.items?.[0];
});

// ── وضعیت نوار دستهبندیها ──────────────────────────────────────────
const activeCategorySlug = computed(() => String(route.query.category || ''));
const activeTagSlug = computed(() => String(route.query.tag || ''));

function selectCategory(slug?: string) {
  const query: Record<string, any> =
    route.path === '/magazine' ? { ...route.query } : {};
  query.category = slug || undefined;
  delete query.page;
  router.push({ path: '/magazine', query });
}

function clearFilters() {
  router.push({ path: '/magazine', query: {} });
}

// ── جستجو ──────────────────────────────────────────────────────────
const searchQuery = ref(String(route.query.search || ''));
watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = String(value || '');
  },
);

let searchTimer: ReturnType<typeof setTimeout>;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const query: Record<string, any> =
      route.path === '/magazine' ? { ...route.query } : {};
    query.search = searchQuery.value.trim() || undefined;
    delete query.page;
    router.push({ path: '/magazine', query });
  }, 350);
}

// ── تزئینات سربرگ ──────────────────────────────────────────────────
const today = computed(() =>
  new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()),
);

const cart = useCartStore();
const cartCount = computed(() => Number((cart as any)?.totalCount ?? 0));
</script>

<template>
  <div>
    <!-- نوار بالا: تاریخ، بازگشت به فروشگاه و سبد خرید -->
    <div class="bg-nimoura-velvet text-white/70">
      <div
        class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2 text-[11px] sm:px-8 sm:text-xs"
      >
        <span class="inline-flex items-center gap-1.5">
          <i class="pi pi-calendar text-nimoura-accent text-[10px]" />
          {{ today }}
        </span>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="hidden items-center gap-1.5 transition hover:text-white sm:inline-flex"
          >
            <i class="pi pi-shop text-[10px]" />
            بازگشت به فروشگاه
          </NuxtLink>
          <span class="hidden h-3 w-px bg-white/20 sm:block" />
          <NuxtLink
            to="/cart"
            class="inline-flex items-center gap-1.5 transition hover:text-white"
          >
            <i class="pi pi-shopping-bag text-[10px]" />
            سبد خرید
            <span
              v-if="cartCount"
              class="inline-flex min-w-4 items-center justify-center rounded-full bg-nimoura-primary px-1 py-0.5 text-[9px] font-bold text-white"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- سربرگ ژورنال -->
    <header
      class="relative overflow-hidden border-b border-nimoura-border/40 bg-white"
    >
      <div
        class="pointer-events-none absolute -top-28 right-10 h-80 w-80 rounded-full bg-nimoura-primary/10 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-nimoura-accent/25 blur-3xl"
      />

      <div class="relative mx-auto max-w-6xl px-5 pt-8 pb-8 sm:px-8 sm:pt-10">
        <div class="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <!-- هویت مجله -->
          <div class="max-w-xl">
            <span
              class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-nimoura-base px-3 py-1 text-[10px] font-bold tracking-wide text-nimoura-primary sm:text-[11px]"
            >
              <span class="size-1.5 rounded-full bg-nimoura-primary" />
              NIMOURA JOURNAL · مجله تخصصی زیبایی
            </span>

            <NuxtLink to="/magazine" class="mt-3 block w-fit">
              <h1
                class="font-modam text-4xl leading-none font-black tracking-tight text-nimoura-velvet sm:text-5xl lg:text-6xl"
              >
                نیمورا<span class="text-nimoura-primary">مگ</span>
              </h1>
            </NuxtLink>

            <p
              class="mt-3 max-w-lg text-sm leading-7 text-nimoura-text-600 sm:text-[15px]"
            >
              داستانها، راهنماها و کشفهای تازه در دنیای زیبایی و مراقبت از خود —
              به قلم متخصصان نیمورا.
            </p>
          </div>

          <!-- جستجو + مقاله ویژه (از دادههای API) -->
          <div class="w-full lg:w-[380px]">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="جستجو در مقالات (مثلاً: ضدآفتاب، روتین شب...)"
                class="w-full rounded-2xl border border-nimoura-border/60 bg-nimoura-base/80 py-3 pr-11 pl-10 text-sm text-nimoura-velvet placeholder:text-nimoura-text-400 shadow-xs outline-none transition focus:border-nimoura-primary focus:bg-white focus:ring-2 focus:ring-nimoura-primary/20"
                @input="onSearchInput"
              />
              <i
                class="pi pi-search absolute right-4 top-1/2 -translate-y-1/2 text-sm text-nimoura-text-400 pointer-events-none"
              />
              <button
                v-if="searchQuery"
                type="button"
                aria-label="پاک کردن جستجو"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-nimoura-text-400 transition hover:text-nimoura-velvet"
                @click="searchQuery = ''; onSearchInput()"
              >
                <i class="pi pi-times text-xs" />
              </button>
            </div>

            <NuxtLink
              v-if="featured"
              :to="`/magazine/${featured.slug}`"
              class="group mt-3 flex items-center gap-3 rounded-2xl border border-nimoura-border/40 bg-nimoura-base/70 p-2.5 transition hover:border-nimoura-primary/40 hover:shadow-md"
            >
              <div class="size-14 shrink-0 overflow-hidden rounded-xl bg-nimoura-velvet">
                <img
                  v-if="featured.coverImage"
                  :src="formatImageUrl(featured.coverImage)"
                  :alt="featured.coverImageAlt || featured.title"
                  class="size-full object-cover transition duration-500 group-hover:scale-110"
                />
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10px] font-bold text-nimoura-primary">
                  ✦ مقاله ویژه سردبیر
                </span>
                <p
                  class="line-clamp-2 text-xs leading-5 font-semibold text-nimoura-velvet"
                >
                  {{ featured.title }}
                </p>
              </div>
              <i
                class="pi pi-arrow-left hidden text-xs text-nimoura-primary transition group-hover:-translate-x-1 sm:block"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- نوار چسبنده دستهبندیها -->
    <nav
      class="sticky top-0 z-40 border-b border-nimoura-border/40 bg-white/90 shadow-xs backdrop-blur-xl"
    >
      <div
        class="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-5 py-2.5 sm:px-8 scrollbar-hide"
      >
        <button
          type="button"
          class="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm"
          :class="
            !activeCategorySlug && !activeTagSlug
              ? 'bg-nimoura-primary text-white shadow-xs'
              : 'border border-nimoura-border/40 bg-white/80 text-nimoura-text-600 hover:border-nimoura-primary/40 hover:text-nimoura-velvet'
          "
          @click="selectCategory(undefined)"
        >
          همه مقالات
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="shrink-0 rounded-full px-4 py-1.5 text-xs transition sm:text-sm"
          :class="
            activeCategorySlug === cat.slug
              ? 'bg-nimoura-primary font-bold text-white shadow-xs'
              : 'border border-nimoura-border/40 bg-white/80 text-nimoura-text-600 hover:border-nimoura-primary/40 hover:text-nimoura-velvet'
          "
          @click="selectCategory(cat.slug)"
        >
          {{ cat.name }}
        </button>

        <span
          v-if="activeTagSlug"
          class="mr-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-nimoura-accent/40 px-3 py-1 text-xs font-medium text-nimoura-velvet"
        >
          برچسب: {{ activeTagSlug }}
          <button
            type="button"
            aria-label="حذف فیلتر برچسب"
            class="text-nimoura-text-600 transition hover:text-nimoura-error"
            @click="clearFilters"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </span>
      </div>
    </nav>
  </div>
</template>
