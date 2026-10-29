<template>
  <section class="mx-4 lg:container mt-10 lg:mt-20">
    <!-- SECTION TITLE -->
    <div
      class="flex flex-col gap-y-4 xs:flex-row items-center justify-between w-full text-center xs:text-start"
    >
      <div class="flex items-center gap-x-2 sm:gap-x-4">
            <span
      class="hidden xs:flex size-11 sm:size-12 lg:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 ring-1 ring-nimoura-primary/10"
    >
      <i class="pi pi-sparkles text-lg! sm:text-xl! lg:text-2xl! text-nimoura-primary!" />
    </span>

        <div class="space-y-1 md:space-y-1">
          <h3
            class="text-xl md:text-2xl font-modam font-medium text-nimoura-text-700"
          >
            محبوب‌ترین
            <span class="text-nimoura-primary"> برندها </span>
          </h3>
          <p class="text-sm text-nimoura-text-500">
            جدیدترین و بروزترین برندها
          </p>
        </div>
      </div>
    </div>
    <!-- BRAND Slider -->
    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex touch-pan-y">
        <div
          v-for="brand in brands"
          :key="brand.alt"
          class="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 min-w-0 px-1"
        >
          <div class="py-5">
            <div class="brand-card">
              <NuxtPicture
                :src="brand.src"
                :alt="brand.alt"
                format="avif,webp,jpeg,png"
                :imgAttrs="{ class: 'object-cover' }"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import useEmblaCarousel from "embla-carousel-vue";
import AutoScroll from "embla-carousel-auto-scroll";

const brands = [
  {
    src: "/brand/1.png",
    link: "/brand",
    alt: "ژنوبایوتیک",
  },
  {
    src: "/brand/2.png",
    link: "/brand",
    alt: "ژنوبایوتیک",
  },
  {
    src: "/brand/3.png",
    link: "/brand",
    alt: "ژنوبایوتیک",
  },
  {
    src: "/brand/4.png",
    link: "/brand",
    alt: "ژنوبایوتیک",
  },
  {
    src: "/brand/5.png",
    link: "/brand",
    alt: "ژنوبایوتیک",
  },
  {
    src: "/brand/6.png",
    link: "/brand",
    alt: "ژنوبایوتیک",
  },
];

const [emblaRef] = useEmblaCarousel(
  {
    loop: true,
    dragFree: true,
    direction: "rtl",
  },
  [
    AutoScroll({
      speed: 1,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      startDelay: 100,
    }),
  ],
);
</script>
