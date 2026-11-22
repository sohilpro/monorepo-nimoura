<script setup lang="ts">
import type { Article } from "~~/server/types/magazine";

useHead({
  title: "مجله زیبایی و سلامت نیمورا | مقالات تخصصی آرایش و مراقبت پوست",
  meta: [
    {
      name: "description",
      content:
        "مقالات تخصصی، راهنمای خرید و مقایسه محصولات آرایشی، روتین‌های مراقبت از پوست و مو در مجله نیمورا.",
    },
    { property: "og:title", content: "مجله زیبایی و سلامت نیمورا" },
    {
      property: "og:description",
      content:
        "راهنماهای جامع مراقبت از پوست، بررسی و مقایسه محصولات آرایشی در مجله نیمورا.",
    },
  ],
});

const route = useRoute();
const router = useRouter();

// ---------- متغیرهای جستجو و فیلتر ----------
const searchQuery = ref((route.query.search as string) || "");

watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = String(value || "");
  },
);
const activeCategorySlug = computed(() => (route.query.category as string) || "");
const activeTagSlug = computed(() => (route.query.tag as string) || "");
const activeSort = ref<"latest" | "popular" | "most_liked">(
  (route.query.sort as any) || "latest"
);

// ---------- مقاله ویژه (کاور اصلی) ----------
const { data: featuredData, pending: heroPending }: any = useFetch<{
  items: Article[];
}>("/api/magazine/articles", {
  query: { featured: true, limit: 1, sort: "latest" },
  key: "magazine-hero",
});
const hero = computed<Article | undefined>(() => {
  const f = featuredData.value as any;
  return f?.data?.items?.[0] ?? f?.items?.[0];
});

// ---------- پیشنهاد سردبیر ----------
const { data: picksData, pending: picksPending }: any = useFetch<{
  items: Article[];
}>("/api/magazine/articles", {
  query: { limit: 4, sort: "latest" },
  key: "magazine-picks",
});
const picks = computed<Article[]>(() => {
  const p = picksData.value as any;
  const list = p?.data?.items ?? p?.items ?? [];
  return list.filter((a: any) => a.id !== hero.value?.id).slice(0, 3);
});

// ---------- تازه‌ترین مطالب (گرید فیلتر و صفحه‌بندی‌شده) ----------
const gridQuery = computed(() => ({
  page: Number(route.query.page) || 1,
  limit: 9,
  sort: activeSort.value,
  search: searchQuery.value.trim() || undefined,
  categorySlug: activeCategorySlug.value || undefined,
  tagSlug: activeTagSlug.value || undefined,
}));

const { articles: gridArticles, pending: gridPending } = useArticleList(gridQuery);

const articleList = computed<Article[]>(() => {
  const a = gridArticles.value as any;
  if (Array.isArray(a?.data?.items)) return a.data.items;
  if (Array.isArray(a?.items)) return a.items;
  return [];
});

const articleMeta = computed(() => {
  const a = gridArticles.value as any;
  return a?.data?.meta ?? a?.meta ?? null;
});

function onGridPageChange(page: number) {
  router.push({
    query: {
      ...route.query,
      page: page > 1 ? page : undefined,
    },
  });
  document
    .getElementById("latest-articles")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

let searchTimer: ReturnType<typeof setTimeout>;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.push({
      query: {
        ...route.query,
        search: searchQuery.value.trim() || undefined,
        page: undefined,
      },
    });
  }, 400);
}

function clearFilters() {
  searchQuery.value = "";
  router.push({
    query: {},
  });
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fa-IR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
</script>

<template>
  <div class="bg-nimoura-base min-h-screen">
    <!-- ============ بنر جایگاه مجله ============ -->
    <BannersSlot
      position-key="magazine-top"
      layout="single"
      spacing-class="mx-auto mt-5 max-w-6xl px-5 sm:px-8"
      :contained="false"
    />

    <div class="mx-auto max-w-6xl px-5 sm:px-8 py-8">
      <!-- ============ هیرو: مقاله ویژه (کاور) ============ -->
      <section v-if="!searchQuery && !activeCategorySlug && !activeTagSlug" class="mb-14">
        <div v-if="heroPending" class="w-full">
          <PSkeleton height="440px" class="!rounded-3xl" />
        </div>

        <NuxtLink
          v-else-if="hero"
          :to="`/magazine/${hero.slug}`"
          class="group relative block overflow-hidden rounded-3xl border border-nimoura-border/40 shadow-sm transition-all hover:shadow-xl"
        >
          <div class="aspect-[16/10] w-full sm:aspect-[21/9] bg-nimoura-velvet">
            <img
              v-if="hero.coverImage"
              :src="formatImageUrl(hero.coverImage)"
              :alt="hero.coverImageAlt || hero.title"
              class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div v-else class="h-full w-full bg-gradient-to-br from-nimoura-velvet to-nimoura-dark" />
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-nimoura-velvet/95 via-nimoura-velvet/40 to-transparent" />

          <div class="absolute inset-x-0 bottom-0 p-6 sm:p-12 text-white">
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-nimoura-primary px-3 py-1 text-xs font-bold text-white shadow-xs">
                ✦ مقاله ویژه سردبیر
              </span>
              <span v-if="hero.category?.name" class="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {{ hero.category?.name }}
              </span>
            </div>

            <h2 class="max-w-3xl font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white group-hover:text-nimoura-accent transition-colors">
              {{ hero.title }}
            </h2>

            <p class="mt-3 max-w-2xl text-xs sm:text-base leading-relaxed text-white/85 line-clamp-2">
              {{ hero.summary }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span v-if="hero.author?.name" class="font-medium text-white flex items-center gap-1.5">
                <i class="pi pi-user text-xs text-nimoura-accent" />
                {{ hero.author.name }}
              </span>
              <span class="text-white/40">✦</span>
              <span>{{ hero.readingTime || 4 }} دقیقه زمان مطالعه</span>
              <span class="text-white/40">✦</span>
              <span>{{ formatDate(hero.publishedAt) }}</span>
            </div>
          </div>
        </NuxtLink>
      </section>

      <!-- ============ پیشنهاد سردبیر ============ -->
      <section
        v-if="!searchQuery && !activeCategorySlug && !activeTagSlug && (picksPending || picks.length)"
        class="mb-16"
      >
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="h-6 w-1 rounded-full bg-nimoura-primary" />
            <h2 class="font-display text-xl sm:text-2xl font-bold text-nimoura-velvet">
              پیشنهاد سردبیر
            </h2>
          </div>
          <span class="text-xs text-nimoura-text-400">برترین گزیده‌های هفتگی</span>
        </div>

        <div v-if="picksPending" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PSkeleton height="320px" class="!rounded-2xl lg:col-span-2" />
          <div class="space-y-4">
            <PSkeleton height="95px" class="!rounded-xl" />
            <PSkeleton height="95px" class="!rounded-xl" />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- کارت بزرگتر سمت راست -->
          <div v-if="picks[0]" class="lg:col-span-2">
            <MagazineArticleCard :article="picks[0]" size="lg" />
          </div>

          <!-- ستون کناری دو مقاله -->
          <div class="flex flex-col gap-4">
            <NuxtLink
              v-for="p in picks.slice(1)"
              :key="p.id"
              :to="`/magazine/${p.slug}`"
              class="group flex gap-3.5 rounded-2xl bg-white p-3.5 border border-nimoura-border/40 shadow-xs hover:shadow-md transition"
            >
              <div class="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-nimoura-accent/15">
                <img
                  v-if="p.coverImage"
                  :src="formatImageUrl(p.coverImage)"
                  :alt="p.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div class="min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <span class="text-[11px] font-bold text-nimoura-primary">{{ p.category?.name }}</span>
                  <h3 class="mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-nimoura-velvet group-hover:text-nimoura-primary transition-colors leading-snug">
                    {{ p.title }}
                  </h3>
                </div>
                <div class="flex items-center gap-2 text-[11px] text-nimoura-text-400 mt-2">
                  <span>{{ p.readingTime || 3 }} دقیقه</span>
                  <span>·</span>
                  <span>{{ formatDate(p.publishedAt) }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ============ تازه‌ترین مطالب (گرید اصلی) ============ -->
      <section id="latest-articles" class="scroll-mt-16">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="h-6 w-1 rounded-full bg-nimoura-primary" />
            <h2 class="font-display text-xl sm:text-2xl font-bold text-nimoura-velvet">
              {{ searchQuery ? `نتایج جستجو برای: «${searchQuery}»` : activeCategorySlug ? `مطالب دسته‌بندی` : 'تازه‌ترین مطالب' }}
            </h2>
            <span v-if="articleMeta" class="text-xs text-nimoura-text-400">
              ({{ articleMeta.totalItems }} مقاله)
            </span>
          </div>

          <!-- مرتب‌سازی -->
          <div class="flex items-center gap-2">
            <label class="text-xs text-nimoura-text-500">مرتب‌سازی:</label>
            <select
              v-model="activeSort"
              class="rounded-xl border border-nimoura-border/50 bg-white px-3 py-1.5 text-xs text-nimoura-text-700 shadow-xs focus:border-nimoura-primary focus:outline-none"
              @change="router.push({ query: { ...route.query, sort: activeSort, page: undefined } })"
            >
              <option value="latest">جدیدترین مقالات</option>
              <option value="popular">پربازدیدترین‌ها</option>
              <option value="most_liked">محبوب‌ترین‌ها (بیشترین لایک)</option>
            </select>
          </div>
        </div>

        <!-- فیلتر فعال و دکمه حذف فیلترها -->
        <div v-if="searchQuery || activeCategorySlug || activeTagSlug" class="mb-6 flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-nimoura-primary/30 bg-white px-3 py-1 text-xs text-nimoura-primary font-medium hover:bg-nimoura-primary hover:text-white transition"
            @click="clearFilters"
          >
            <i class="pi pi-filter-slash text-[11px]" />
            پاک کردن همه فیلترها
          </button>
        </div>

        <MagazineArticleList
          :articles="articleList"
          :pending="gridPending"
          :meta="articleMeta"
          @page-change="onGridPageChange"
        />
      </section>

    </div>
  </div>
</template>

