<script setup lang="ts">
import type { Article } from "~~/server/types/magazine";

useHead({ title: "مجله زیبایی" });

const route = useRoute();

// ---------- دسته‌بندی‌ها برای نوار افقی ----------
const { data: categories } = useMagazineCategoriesTree();

// ---------- مقاله ویژه (کاور) ----------
const { data: featuredData, pending: heroPending }: any = useFetch<{
  items: Article[];
}>("/api/magazine/articles", {
  query: { featured: true, limit: 1, sort: "latest" },
  key: "magazine-hero",
});
const hero = computed(() => featuredData.value?.data.items?.[0]);

// ---------- پیشنهاد سردبیر ----------
const { data: picksData, pending: picksPending }: any = useFetch<{
  items: Article[];
}>("/api/magazine/articles", {
  query: { limit: 4, sort: "latest" },
  key: "magazine-picks",
});
const picks = computed(() =>
  (picksData.value?.data.items ?? [])
    .filter((a: any) => a.id !== hero.value?.id)
    .slice(0, 3),
);

// ---------- تازه‌ترین مطالب (گرید صفحه‌بندی‌شده) ----------
const gridQuery = ref({ page: 1, limit: 9, sort: "latest" as const });
const { articles: gridArticles, pending: gridPending }: any =
  useArticleList(gridQuery);

function onGridPageChange(page: number) {
  gridQuery.value = { ...gridQuery.value, page };
  document
    .getElementById("latest")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fa-IR", {
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div class="bg-nimoura-base">
    <!-- ============ نوار بالای صفحه ============ -->
    <header class="border-b border-nimoura-border/40">
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"
      >
        <NuxtLink
          to="/magazine"
          class="font-display text-2xl font-bold text-nimoura-velvet"
        >
          مجله <span class="text-nimoura-primary">نیمورا</span>
        </NuxtLink>
        <NuxtLink
          to="/"
          class="flex items-center gap-1.5 text-sm text-nimoura-text-500 transition hover:text-nimoura-primary"
        >
          فروشگاه نیمورا
          <i class="pi pi-arrow-left text-xs" />
        </NuxtLink>
      </div>
    </header>

    <!-- ============ هیرو: مقاله ویژه ============ -->
    <section v-if="heroPending" class="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <PSkeleton height="440px" class="!rounded-3xl" />
    </section>

    <section v-else-if="hero" class="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
      <NuxtLink
        :to="`/magazine/${hero.slug}`"
        class="group relative block overflow-hidden rounded-3xl motion-safe:animate-hero-in"
      >
        <div class="aspect-[16/10] w-full sm:aspect-[21/9]">
          <img
            v-if="hero.coverImage"
            :src="hero.coverImage"
            :alt="hero.coverImageAlt || hero.title"
            class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div v-else class="h-full w-full bg-nimoura-accent/30" />
        </div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-nimoura-velvet/95 via-nimoura-velvet/25 to-transparent"
        />

        <div class="absolute inset-x-0 bottom-0 p-6 sm:p-12">
          <span
            class="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
          >
            {{ hero.category?.name }}
          </span>
          <h1
            class="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl"
          >
            {{ hero.title }}
          </h1>
          <p class="mt-3 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            {{ hero.summary }}
          </p>
          <div
            class="mt-5 flex items-center gap-3 text-xs text-white/60 sm:text-sm"
          >
            <span>{{ hero.author?.name }}</span>
            <span class="text-nimoura-accent">✦</span>
            <span>{{ hero.readingTime }} دقیقه مطالعه</span>
          </div>
        </div>
      </NuxtLink>
    </section>

    <!-- ============ نوار دسته‌بندی ============ -->
    <nav
      v-if="categories?.length"
      class="sticky top-0 z-10 mt-10 border-y border-nimoura-border/40 bg-nimoura-base/90 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-5 py-3.5 sm:px-8"
      >
        <NuxtLink
          to="/magazine"
          class="shrink-0 whitespace-nowrap text-sm font-semibold transition"
          :class="
            route.path === '/magazine'
              ? 'text-nimoura-primary'
              : 'text-nimoura-text-500 hover:text-nimoura-velvet'
          "
        >
          همه مطالب
        </NuxtLink>
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/magazine/category/${cat.slug}`"
          class="shrink-0 whitespace-nowrap text-sm text-nimoura-text-500 transition hover:text-nimoura-velvet"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
    </nav>

    <!-- ============ پیشنهاد سردبیر ============ -->
    <section
      v-if="picksPending || picks.length"
      class="mx-auto max-w-6xl px-5 pt-12 sm:px-8"
    >
      <div class="mb-6 flex items-center gap-3">
        <h2
          class="font-display text-xl font-bold text-nimoura-velvet sm:text-2xl"
        >
          پیشنهاد سردبیر
        </h2>
        <span class="h-px flex-1 bg-nimoura-border/40" />
      </div>

      <div v-if="picksPending" class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <PSkeleton height="260px" class="!rounded-2xl lg:col-span-2" />
        <div class="space-y-8">
          <PSkeleton height="110px" class="!rounded-2xl" />
          <PSkeleton height="110px" class="!rounded-2xl" />
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
        <MagazineArticleCard
          v-if="picks[0]"
          :article="picks[0]"
          size="lg"
          class="lg:col-span-2"
        />

        <div class="flex flex-col gap-8">
          <NuxtLink
            v-for="p in picks.slice(1)"
            :key="p.id"
            :to="`/magazine/${p.slug}`"
            class="group flex gap-4"
          >
            <div
              class="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-nimoura-accent/15"
            >
              <img
                v-if="p.coverImage"
                :src="p.coverImage"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div class="min-w-0">
              <span class="text-xs font-semibold text-nimoura-primary">{{
                p.category?.name
              }}</span>
              <h3
                class="mt-1 line-clamp-2 font-display text-base font-bold leading-snug text-nimoura-velvet group-hover:text-nimoura-primary"
              >
                {{ p.title }}
              </h3>
              <span class="mt-1 block text-xs text-nimoura-text-400">{{
                formatDate(p.publishedAt)
              }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ تازه‌ترین مطالب ============ -->
    <section
      id="latest"
      class="mx-auto max-w-6xl scroll-mt-20 px-5 pt-16 sm:px-8"
    >
      <div class="mb-8 flex items-center gap-3">
        <h2
          class="font-display text-xl font-bold text-nimoura-velvet sm:text-2xl"
        >
          تازه‌ترین مطالب
        </h2>
        <span class="h-px flex-1 bg-nimoura-border/40" />
      </div>

      <MagazineArticleList
        :articles="gridArticles?.data.items"
        :pending="gridPending"
        :meta="gridArticles?.meta"
        @page-change="onGridPageChange"
      />
    </section>

    <!-- ============ خبرنامه ============ -->
    <section class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <MagazineNewsletterBox />
    </section>
  </div>
</template>
