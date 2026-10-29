<template>
  <div class=" w-full overflow-hidden rounded-xl">
    <!-- <div  class="px-3 lg:container w-full mt-4 lg:mt-10">
    <div class="relative w-full overflow-hidden rounded-xl">
      <Skeleton width="100%" height="24rem" border-radius="0.75rem" />
   
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <Skeleton v-for="i in 5" :key="i" width="0.5rem" height="0.625rem" border-radius="9999px" />
      </div>
    </div>
  </div> -->
    <div class="px-3 relative lg:container w-full mt-4 lg:mt-10">
      <!-- کروسل -->
      <div ref="emblaRef" class="overflow-hidden rounded-xl">
        <div class="flex touch-pan-y">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="flex-none w-full h-auto lg:h-96"
          >
            <img
              :src="image.itemImageSrc"
              :alt="image.alt"
              class="w-full h-auto lg:h-full object-cover block select-none"
            />
          </div>
        </div>
      </div>

      <!-- دکمه قبلی -->
      <button
        class="z-20 text-white absolute left-20 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded transition-all"
        @click="scrollPrev"
      >
        <span class="pi pi-chevron-left text-xl"></span>
      </button>

      <!-- دکمه بعدی -->
      <button
        class="z-20 text-white absolute right-20 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded transition-all"
        @click="scrollNext"
      >
        <span class="pi pi-chevron-right text-xl"></span>
      </button>

      <!-- dots -->
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
      >
        <button
          v-for="(_, index) in images"
          :key="index"
          class="h-2.5 rounded-full transition-all duration-300"
          :class="
            activeIndex === index
              ? 'w-5 bg-nimoura-primary'
              : 'w-2 bg-white/60 hover:bg-white'
          "
          :aria-label="`Go to slide ${index + 1}`"
          @click="scrollTo(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";
import Autoplay from "embla-carousel-autoplay";

const [emblaRef, emblaApi] = useEmblaCarousel(
  { loop: true, align: "start", direction: "rtl" },
  [Autoplay({ delay: 4000, stopOnInteraction: false })],
);

const activeIndex = ref(0);

watch(emblaApi, (api) => {
  if (!api) return;
  api.on("select", () => {
    activeIndex.value = api.selectedScrollSnap();
  });
});

const scrollPrev = () => emblaApi.value?.scrollPrev();
const scrollNext = () => emblaApi.value?.scrollNext();
const scrollTo = (index: number) => emblaApi.value?.scrollTo(index);

const images = ref([
  {
    itemImageSrc:
      "https://primefaces.org/cdn/primevue/images/galleria/galleria1.jpg",
    alt: "Description for Image 1",
  },
  {
    itemImageSrc:
      "https://primefaces.org/cdn/primevue/images/galleria/galleria2.jpg",
    alt: "Description for Image 2",
  },
  {
    itemImageSrc:
      "https://primefaces.org/cdn/primevue/images/galleria/galleria3.jpg",
    alt: "Description for Image 3",
  },
  {
    itemImageSrc:
      "https://primefaces.org/cdn/primevue/images/galleria/galleria4.jpg",
    alt: "Description for Image 4",
  },
  {
    itemImageSrc:
      "https://primefaces.org/cdn/primevue/images/galleria/galleria5.jpg",
    alt: "Description for Image 5",
  },
]);
</script>
