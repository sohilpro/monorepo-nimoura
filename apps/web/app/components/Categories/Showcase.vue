<template>
  <section
    class="mx-auto w-full px-4 lg:container my-8 sm:my-10 lg:my-14"
    aria-label="دسته‌بندی‌های برگزیده"
  >
    <!-- ══ SECTION HEADER ══ -->
    <div
      v-if="showHeader"
      class="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end"
    >
      <div class="space-y-1 flex flex-col sm:space-y-1.5">
        <div class="flex items-center gap-2">
          <span
            class="inline-flex size-2 rounded-full bg-nimoura-primary animate-pulse"
            aria-hidden="true"
          />
          <span class="text-xs font-medium text-nimoura-primary tracking-wide">
            {{ badgeText || 'خرید هوشمند بر اساس دسته‌بندی' }}
          </span>
        </div>

        <h2
          class="font-modam text-xl font-bold leading-tight text-nimoura-text-800 sm:text-2xl lg:text-3xl"
        >
          {{ title }}
          <span v-if="highlight" class="text-nimoura-primary">
            {{ highlight }}
          </span>
        </h2>

        <p v-if="subtitle" class="text-xs text-nimoura-text-500 sm:text-sm">
          {{ subtitle }}
        </p>
      </div>

      <NuxtLink
        v-if="allLink"
        :to="allLink"
        class="group inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-nimoura-text-600 transition-colors hover:text-nimoura-primary sm:text-sm"
      >
        <span>مشاهده همه دسته‌ها</span>
        <i
          class="pi pi-arrow-left text-xs transition-transform duration-200 group-hover:-translate-x-1"
          aria-hidden="true"
        />
      </NuxtLink>
    </div>

    <!-- ══ SKELETON LOADING STATE (Zero-CLS) ══ -->
    <template v-if="loading">
      <!-- Grid Skeleton -->
      <div
        v-if="variant === 'grid'"
        class="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"
      >
        <div
          v-for="n in limit"
          :key="`sk-grid-${n}`"
          class="flex flex-col items-center gap-2.5 rounded-2xl border border-nimoura-text-100 bg-white p-2.5 sm:p-3.5 shadow-xs"
        >
          <div class="aspect-square w-full rounded-xl overflow-hidden">
            <Skeleton width="100%" height="100%" border-radius="0.75rem" />
          </div>
          <Skeleton width="70%" height="0.85rem" border-radius="0.375rem" />
          <Skeleton width="50%" height="0.65rem" border-radius="0.25rem" class="hidden sm:block" />
        </div>
      </div>

      <!-- Scroll / Strip Skeleton -->
      <div
        v-else-if="variant === 'scroll'"
        class="no-scrollbar flex gap-3 overflow-hidden"
      >
        <div
          v-for="n in limit"
          :key="`sk-scroll-${n}`"
          class="w-36 shrink-0 flex-col items-center gap-2 rounded-2xl border border-nimoura-text-100 bg-white p-3"
        >
          <div class="aspect-square w-full rounded-xl overflow-hidden mb-2">
            <Skeleton width="100%" height="100%" border-radius="0.75rem" />
          </div>
          <Skeleton width="75%" height="0.85rem" border-radius="0.375rem" />
        </div>
      </div>

      <!-- Circles Skeleton -->
      <div
        v-else-if="variant === 'circle'"
        class="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
      >
        <div
          v-for="n in limit"
          :key="`sk-circ-${n}`"
          class="flex flex-col items-center gap-2"
        >
          <Skeleton width="5rem" height="5rem" shape="circle" />
          <Skeleton width="4rem" height="0.75rem" border-radius="0.25rem" />
        </div>
      </div>

      <!-- Hero Cards Skeleton -->
      <div
        v-else
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="n in Math.min(limit, 3)"
          :key="`sk-hero-${n}`"
          class="h-44 rounded-3xl overflow-hidden"
        >
          <Skeleton width="100%" height="100%" border-radius="1.5rem" />
        </div>
      </div>
    </template>

    <!-- ══ CONTENT VARIANTS ══ -->
    <template v-else-if="resolvedList.length">
      <!-- ── Variant 1: Luxury Responsive Grid (Default) ── -->
      <div
        v-if="variant === 'grid'"
        class="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"
      >
        <NuxtLink
          v-for="item in resolvedList"
          :key="item.id"
          :to="item.to"
          class="group relative flex flex-col items-center rounded-2xl border border-nimoura-text-100/80 bg-white p-2.5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md sm:p-3.5"
        >
          <!-- Image Box with Squircle & Ambient Glow -->
          <div
            class="relative mb-2.5 aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:shadow-sm"
            :class="item.gradientClass"
          >
            <img
              :src="formatImageUrl(item.image)"
              :alt="item.name"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            />

            <!-- Subtle Gradient Shine Overlay -->
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-60 transition-opacity group-hover:opacity-40"
            />

            <!-- Category Badge (Desktop) -->
            <span
              v-if="item.badge"
              class="absolute top-1.5 start-1.5 hidden rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-nimoura-text-700 shadow-xs backdrop-blur-xs transition-colors group-hover:bg-nimoura-primary group-hover:text-white sm:inline-block"
            >
              {{ item.badge }}
            </span>
          </div>

          <!-- Category Name -->
          <h3
            class="line-clamp-1 font-vazir text-xs font-bold text-nimoura-text-800 transition-colors group-hover:text-nimoura-primary sm:text-sm"
          >
            {{ item.name }}
          </h3>

          <!-- Subtitle / Keywords (Hidden on small phones to keep density clean) -->
          <p
            v-if="item.keywords"
            class="mt-1 hidden line-clamp-1 text-[11px] text-nimoura-text-400 transition-colors group-hover:text-nimoura-text-600 sm:block"
          >
            {{ item.keywords }}
          </p>
        </NuxtLink>
      </div>

      <!-- ── Variant 2: Horizontal Smooth Scroll Strip ── -->
      <div
        v-else-if="variant === 'scroll'"
        class="no-scrollbar flex gap-3 overflow-x-auto touch-pan-x snap-x scroll-smooth pb-2"
      >
        <NuxtLink
          v-for="item in resolvedList"
          :key="item.id"
          :to="item.to"
          class="group flex w-36 shrink-0 snap-start flex-col items-center rounded-2xl border border-nimoura-text-100/90 bg-white p-3 text-center transition-all duration-300 hover:border-nimoura-primary/40 hover:shadow-md sm:w-40 sm:p-3.5"
        >
          <div
            class="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br"
            :class="item.gradientClass"
          >
            <img
              :src="formatImageUrl(item.image)"
              :alt="item.name"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
          </div>

          <h3
            class="line-clamp-1 font-vazir text-xs font-bold text-nimoura-text-800 transition-colors group-hover:text-nimoura-primary sm:text-sm"
          >
            {{ item.name }}
          </h3>
          <span
            v-if="item.badge"
            class="mt-1 text-[10px] text-nimoura-text-400"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>

      <!-- ── Variant 3: Circular Story Avatars ── -->
      <div
        v-else-if="variant === 'circle'"
        class="flex flex-wrap items-center justify-center gap-3 sm:gap-6"
      >
        <NuxtLink
          v-for="item in resolvedList"
          :key="item.id"
          :to="item.to"
          class="group flex flex-col items-center gap-2 transition-transform duration-200 hover:-translate-y-1"
        >
          <div
            class="relative size-18 rounded-full p-0.5 ring-2 ring-nimoura-text-200 transition-all duration-300 group-hover:ring-nimoura-primary sm:size-22"
          >
            <div class="h-full w-full overflow-hidden rounded-full">
              <img
                :src="formatImageUrl(item.image)"
                :alt="item.name"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>

          <span
            class="line-clamp-1 max-w-[85px] text-center font-vazir text-xs font-semibold text-nimoura-text-700 transition-colors group-hover:text-nimoura-primary"
          >
            {{ item.name }}
          </span>
        </NuxtLink>
      </div>

      <!-- ── Variant 4: Hero Feature Cards (3 large showcase banners) ── -->
      <div
        v-else-if="variant === 'hero-cards'"
        class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="item in resolvedList.slice(0, 3)"
          :key="item.id"
          :to="item.to"
          class="group relative h-48 sm:h-56 overflow-hidden rounded-3xl border border-nimoura-text-100 shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <img
            :src="formatImageUrl(item.image)"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />

          <!-- Gradient Wash -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-nimoura-dark/85 via-nimoura-dark/35 to-transparent"
          />

          <!-- Card Content -->
          <div class="absolute inset-x-0 bottom-0 p-5 text-white">
            <span
              v-if="item.badge"
              class="inline-block rounded-full bg-nimoura-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs"
            >
              {{ item.badge }}
            </span>
            <h3 class="mt-1.5 font-modam text-lg font-bold sm:text-xl">
              {{ item.name }}
            </h3>
            <p
              v-if="item.keywords"
              class="mt-1 text-xs text-white/80 line-clamp-1"
            >
              {{ item.keywords }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { createSlug } from '@nimoura/utils';
import { useCategories } from '~/composables/useCategories';
import { useCategoryVisuals } from '~/composables/useCategoryVisuals';

export interface CustomCategoryShowcaseItem {
  id?: number | string;
  name: string;
  slug?: string;
  image?: string;
  badge?: string;
  keywords?: string;
  to?: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    highlight?: string;
    subtitle?: string;
    badgeText?: string;
    allLink?: string;
    showHeader?: boolean;
    variant?: 'grid' | 'scroll' | 'circle' | 'hero-cards';
    limit?: number;
    items?: CustomCategoryShowcaseItem[];
  }>(),
  {
    title: 'دسته‌بندی‌های',
    highlight: 'برگزیده',
    subtitle: 'محبوب‌ترین لاین‌های زیبایی، مراقبت و سلامت پوست و مو',
    allLink: '',
    showHeader: true,
    variant: 'grid',
    limit: 6,
    items: () => [],
  },
);

const { categories, pending } = useCategories();

const loading = computed(() => {
  if (props.items && props.items.length > 0) return false;
  return pending.value && (!categories.value || categories.value.length === 0);
});

// دسته‌بندی‌های پیش‌فرض و شاخص فروشگاه با لینک‌های دقیق و محتوای باکیفیت
const FALLBACK_SHOWCASE_ITEMS = [
  {
    id: 1,
    name: 'آرایش صورت و لب',
    slug: 'lwzm-arishi',
    keywords: 'رژ لب، کرم‌پودر، رژگونه',
    badge: 'محبوب‌ترین',
  },
  {
    id: 2,
    name: 'آرایش چشم و مژه',
    slug: 'arish-chshm',
    keywords: 'ریمل، خط چشم، سایه',
    badge: 'پرفروش',
  },
  {
    id: 3,
    name: 'مراقبت از پوست',
    slug: 'mrghbt-pwsti',
    keywords: 'آبرسان، ضد آفتاب، سرم',
    badge: 'روتین پوستی',
  },
  {
    id: 4,
    name: 'مراقبت و سلامت مو',
    slug: 'mrghbt-w-zibii-mw',
    keywords: 'شامپو تخصصی، ماسک مو',
    badge: 'تقویت و ترمیم',
  },
  {
    id: 5,
    name: 'مراقبت شخصی و بدن',
    slug: 'mrghbt-shkhsi',
    keywords: 'ضد تعریق، لوسیون، بهداشت',
    badge: 'بهداشت روزانه',
  },
  {
    id: 6,
    name: 'عطر و ادکلن',
    slug: 'bhdshti-aatr-w-spri',
    keywords: 'ادوپرفیوم، بادی اسپلش، میست',
    badge: 'رایحه ماندگار',
  },
];

const resolvedList = computed(() => {
  // ۱. اگر آیتم‌های دستی پاس داده شده باشند
  if (props.items && props.items.length > 0) {
    return props.items.slice(0, props.limit).map((item, idx) => {
      const visual = useCategoryVisuals(item.slug, item.name, {
        image: item.image,
        badge: item.badge,
      });
      return {
        id: item.id ?? idx,
        name: item.name,
        slug: item.slug,
        image: item.image || visual.meta.image,
        badge: item.badge ?? visual.meta.badge,
        keywords: item.keywords ?? visual.meta.keywords,
        gradientClass: visual.meta.gradientClass,
        to: item.to || `/categories/${item.slug || createSlug(item.name)}`,
      };
    });
  }

  // ۲. در غیر این صورت، ترکیب دسته‌های داینامیک درخت با اطلاعات بصری غنی
  const treeList = (categories.value ?? []) as any[];

  if (treeList.length > 0) {
    const showcaseCategories = treeList
      .filter((cat) => cat.showInShowcase !== false)
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

    const targetList = showcaseCategories.length > 0 ? showcaseCategories : treeList;

    return targetList.slice(0, props.limit).map((cat) => {
      const visual = useCategoryVisuals(cat.slug, cat.name, {
        image: cat.image,
        badge: cat.badge,
        icon: cat.icon,
      });
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: visual.meta.image,
        badge: visual.meta.badge,
        keywords: visual.meta.keywords,
        gradientClass: visual.meta.gradientClass,
        to: `/categories/${cat.slug || createSlug(cat.name)}`,
      };
    });
  }

  // ۳. حالت Fallback در صورت خالی بودن دیتابیس
  return FALLBACK_SHOWCASE_ITEMS.slice(0, props.limit).map((item) => {
    const visual = useCategoryVisuals(item.slug, item.name);
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: visual.meta.image,
      badge: item.badge ?? visual.meta.badge,
      keywords: item.keywords ?? visual.meta.keywords,
      gradientClass: visual.meta.gradientClass,
      to: `/categories/${item.slug || createSlug(item.name)}`,
    };
  });
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
