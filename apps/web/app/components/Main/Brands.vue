<template>
  <section
    v-if="!pending || displayBrands.length > 0"
    class="mx-4 lg:container mt-12 mb-8 lg:mt-20 lg:mb-14"
    aria-label="برندهای محبوب نیمورا"
  >
    <!-- ══ SECTION HEADER ══ -->
    <div
      class="flex flex-col gap-y-3 xs:flex-row xs:items-center justify-between w-full text-center xs:text-start mb-6 lg:mb-8"
    >
      <div class="flex items-center gap-x-2.5 sm:gap-x-4 justify-center xs:justify-start">
        <span
          class="hidden xs:flex size-11 sm:size-12 lg:size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 ring-1 ring-nimoura-primary/10 text-nimoura-primary shadow-xs"
        >
          <i class="pi pi-sparkles text-lg sm:text-xl lg:text-2xl" aria-hidden="true" />
        </span>

        <div class="space-y-0.5 sm:space-y-1">
          <h3
            class="text-xl sm:text-2xl font-modam font-bold text-nimoura-text-800"
          >
            محبوب‌ترین
            <span class="text-nimoura-primary">برندها</span>
          </h3>
          <p class="text-xs sm:text-sm text-nimoura-text-500">
            اصیل‌ترین و معتبرترین برندهای آرایشی و مراقبتی
          </p>
        </div>
      </div>

      <span class="hidden sm:inline-flex items-center gap-1.5 text-xs text-nimoura-text-400 font-medium">
        <span class="size-2 rounded-full bg-nimoura-primary/60 animate-ping" />
        ضمانت ۱۰۰٪ اصالت برندها
      </span>
    </div>

    <!-- ══ SKELETON LOADING ══ -->
    <div v-if="pending && !displayBrands.length" class="overflow-hidden">
      <div class="flex gap-3">
        <div
          v-for="n in 6"
          :key="`brand-sk-${n}`"
          class="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 min-w-0"
        >
          <div class="rounded-2xl border border-nimoura-text-100 bg-white p-4 flex flex-col items-center gap-3 animate-pulse">
            <Skeleton width="4rem" height="4rem" border-radius="0.75rem" />
            <Skeleton width="60%" height="0.85rem" border-radius="0.375rem" />
          </div>
        </div>
      </div>
    </div>

    <!-- ══ BRANDS SLIDER (Auto-scrolling continuous carousel) ══ -->
    <div v-else ref="emblaRef" class="overflow-hidden py-2">
      <div class="flex touch-pan-y items-center">
        <div
          v-for="brand in displayBrands"
          :key="brand.id || brand.slug"
          class="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 min-w-0 px-1.5 sm:px-2"
        >
          <NuxtLink
            :to="brand.to"
            class="group relative flex flex-col items-center justify-center rounded-2xl border border-nimoura-text-100/80 bg-white p-3.5 sm:p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md"
            :title="`مشاهده محصولات برند ${brand.name}`"
          >
            <!-- Logo Container -->
            <div
              class="relative flex h-16 w-full items-center justify-center overflow-hidden rounded-xl bg-nimoura-base/40 p-2 transition-colors group-hover:bg-nimoura-base/80 sm:h-20"
            >
              <img
                :src="brand.logo"
                :alt="`لوگوی برند ${brand.name}`"
                loading="lazy"
                class="max-h-full max-w-full object-contain filter grayscale opacity-75 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                @error="onImageError($event, brand)"
              />
            </div>

            <!-- Brand Name -->
            <span
              class="mt-2.5 line-clamp-1 font-vazir text-xs font-semibold text-nimoura-text-700 transition-colors group-hover:text-nimoura-primary sm:text-sm"
            >
              {{ brand.name }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";
import AutoScroll from "embla-carousel-auto-scroll";
import { createSlug } from "@nimoura/utils";

interface BrandItem {
  id: number | string;
  name: string;
  slug: string;
  logo: string;
  to: string;
}

// نگاشت اختصاصی لوگوهای محلی برای برندهای اصلی فروشگاه
const BRAND_LOCAL_LOGOS: Record<string, string> = {
  essence: "/brand/1.png",
  olibolla: "/brand/2.png",
  bioksin: "/brand/3.png",
  dove: "/brand/4.png",
  kemes: "/brand/5.png",
  genobiotic: "/brand/6.png",
};

// لیست برندهای تکمیلی جهت تضمین حضور حداقل ۱۰ برند معتبر آرایشی و مراقبتی
const FALLBACK_BRANDS = [
  { id: 1, name: "اسنس", slug: "essence", logo: "/brand/1.png" },
  { id: 2, name: "اولیبولا", slug: "olibolla", logo: "/brand/2.png" },
  { id: 3, name: "بیوکسین", slug: "bioksin", logo: "/brand/3.png" },
  { id: 4, name: "داو", slug: "dove", logo: "/brand/4.png" },
  { id: 5, name: "کمس", slug: "kemes", logo: "/brand/5.png" },
  { id: 6, name: "ژنوبایوتیک", slug: "genobiotic", logo: "/brand/6.png" },
  { id: 7, name: "لورآل", slug: "loreal", logo: "/brand/1.png" },
  { id: 8, name: "سیمپل", slug: "simple", logo: "/brand/2.png" },
  { id: 9, name: "نوتروژینا", slug: "neutrogena", logo: "/brand/3.png" },
  { id: 10, name: "کلینیک", slug: "clinique", logo: "/brand/4.png" },
];

// دریافت ۱۰ برند برتر از API
const { data: apiResponse, pending } = await useFetch<any>("/api/brands", {
  query: { limit: 10 },
  key: "home-brands-showcase-10",
  lazy: true,
});

const displayBrands = computed<BrandItem[]>(() => {
  const d = apiResponse.value?.data ?? apiResponse.value;
  const rawList: any[] = d?.brands ?? d?.items ?? [];

  const mapped: BrandItem[] = rawList.map((b, index) => {
    const slug = b.slug || createSlug(b.name);
    const localFallback =
      BRAND_LOCAL_LOGOS[slug] || `/brand/${(index % 6) + 1}.png`;
    return {
      id: b.id,
      name: b.name,
      slug,
      logo: b.logo?.trim() || localFallback,
      to: `/brand/${encodeURIComponent(slug)}`,
    };
  });

  // اگر کمتر از ۱۰ برند در دیتابیس بود، با برندهای معتبر تا ۱۰ عدد تکمیل کن (دقیقاً حدود ۱۰ برند)
  if (mapped.length < 10) {
    const existingSlugs = new Set(mapped.map((b) => b.slug));
    for (const fb of FALLBACK_BRANDS) {
      if (!existingSlugs.has(fb.slug)) {
        mapped.push({
          ...fb,
          to: `/brand/${encodeURIComponent(fb.slug)}`,
        });
        existingSlugs.add(fb.slug);
      }
      if (mapped.length >= 10) break;
    }
  }

  return mapped.slice(0, 10);
});

// فال‌بک خودکار در صورت لود نشدن عکس
function onImageError(e: Event, brand: BrandItem) {
  const img = e.target as HTMLInputElement;
  const fallback = BRAND_LOCAL_LOGOS[brand.slug] || "/brand/1.png";
  if (img.src !== fallback) {
    img.src = fallback;
  }
}

// -------------------- Embla AutoScroll --------------------
const [emblaRef] = useEmblaCarousel(
  {
    loop: true,
    dragFree: true,
    direction: "rtl",
  },
  [
    AutoScroll({
      speed: 1.1,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      startDelay: 100,
    }),
  ],
);
</script>
