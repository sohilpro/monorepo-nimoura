<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";

const { videos, pending, loadMore } = useExploreFeed();

const sectionRef = ref<HTMLElement | null>(null);
const hasFetched = ref(false);

// نکته: این div همیشه mount هست (نه پشت v-if/v-else)، و dir="rtl" دستی
// روش ست نمی‌شه - فقط آپشن direction: "rtl" کافیه.
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: false,
  align: "start",
  dragFree: true,
  direction: "rtl",
  containScroll: "trimSnaps",
});

async function fetchInitial() {
  if (hasFetched.value) return;
  hasFetched.value = true;
  await loadMore();
  await nextTick();
  emblaApi.value?.reInit();
}

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        fetchInitial();
        observer?.disconnect();
        observer = null;
      }
    },
    { rootMargin: "200px 0px" },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => observer?.disconnect());

// -------------------- مودال اکسپلور --------------------
const showModal = ref(false);
const startIndex = ref(0);

function openVideo(index: number) {
  startIndex.value = index;
  showModal.value = true;
}
</script>

<template>
  <section ref="sectionRef" class="lg:container mt-10 lg:mt-20">
    <!-- عنوان بخش -->
    <div class="flex items-center justify-between w-full px-4 lg:px-0 mb-5">
      <div class="flex items-center gap-x-3">
        <span
          class="hidden xs:flex size-11 sm:size-12 lg:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 ring-1 ring-nimoura-primary/10"
        >
          <i
            class="pi pi-video text-lg! sm:text-xl! lg:text-2xl! text-nimoura-primary!"
          />
        </span>
        <div class="space-y-0.5 sm:space-y-1">
          <h3
            class="text-lg sm:text-xl lg:text-2xl font-modam font-medium text-nimoura-text-700"
          >
            جادوی  <span class="text-nimoura-primary">نیمورا</span>
          </h3>
          <p class="text-xs sm:text-sm text-nimoura-text-500">
          زیبایی را جور دیگری کشف کن
          </p>
        </div>
      </div>

        <NuxtLink
           to="/videos"
          class="group shadow-xl text-sm md:text-base flex items-center gap-x-1 md:gap-x-1.5 px-3 sm:px-2 md:px-3 h-9 sm:h-10 text-white bg-nimoura-primary rounded-xl transition-transform active:scale-95"
        >
          <span class="flex gap-1 whitespace-nowrap">
            <span class="hidden lg:inline">مشاهده</span> همه
          </span>
          <span
            class="size-6 sm:size-7 rounded-full flex-center md:group-hover:-translate-x-1 transition-transform duration-300"
          >
            <i class="pi pi-arrow-left text-base sm:text-lg lg:text-xl"></i>
          </span>
        </NuxtLink>
    </div>

    <!-- کاروسل -->
    <div ref="emblaRef" class="overflow-hidden px-4 lg:px-0">
      <div class="flex gap-2.5 sm:gap-3 touch-pan-y">
        <!-- اسکلتون -->
        <template v-if="pending || !videos.length">
          <div
            v-for="i in 6"
            :key="`skeleton-${i}`"
            class="flex-none w-28 h-44 sm:w-32 sm:h-52"
          >
            <Skeleton width="100%" height="100%" border-radius="1rem" />
          </div>
        </template>

        <!-- کارت‌های ویدیو -->
        <template v-else>
          <button
            v-for="(video, index) in videos"
            :key="video.id"
            type="button"
            class="group relative flex-none w-28 h-44 sm:w-32 sm:h-52 overflow-hidden rounded-2xl"
            @click="openVideo(index)"
          >
            <!-- Poster -->
            <img
              :src="video.posterUrl"
              :alt="video.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            <!-- Gradient -->
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent"
            />

            <!-- Play Icon -->
            <div
              class="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <i
                class="pi pi-play-circle text-4xl! text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-all duration-300 group-hover:scale-110"
              />
            </div>

            <!-- Title -->
            <p
              class="absolute bottom-2 right-2 left-2 line-clamp-2 text-right text-xs font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
            >
              {{ video.title }}
            </p>
          </button>
        </template>
      </div>
    </div>

    <VideoFeedModal
      v-model:visible="showModal"
      :videos="videos"
      :start-index="startIndex"
      :pending="pending"
      @load-more="loadMore"
    />
  </section>
</template>
