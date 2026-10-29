<script setup lang="ts">
const props = defineProps<{
  video: ExploreVideo;
  size: "large" | "small";
}>();

const emit = defineEmits<{ open: [] }>();

const tileRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  // فقط تایل بزرگ هر بخش به‌صورت خودکار پخش می‌شه
  if (props.size !== "large" || !tileRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!videoRef.value) return;
      if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
        videoRef.value.play().then(() => (isPlaying.value = true)).catch(() => {});
      } else {
        videoRef.value.pause();
        isPlaying.value = false;
      }
    },
    { threshold: [0, 0.5] },
  );
  observer.observe(tileRef.value);
});

onBeforeUnmount(() => observer?.disconnect());

function formatViews(count: number) {
  if (count >= 1000) {
    const k = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${k} هزار`;
    // return `${toPersianDigits(k)} هزار`;
  }
  return count;
//   return toPersianDigits(count);
}
</script>

<template>
  <div
    ref="tileRef"
    role="button"
    class="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-nimoura-text-100 outline-2 outline-offset-0 outline-transparent transition-[outline-color] duration-300 hover:outline-nimoura-primary/60"
    :class="size === 'large' ? 'h-full' : 'aspect-square'"
    @click="emit('open')"
  >
    <!-- تایل بزرگ: پیش‌نمایش زنده و بی‌صدا -->
    <video
      v-if="size === 'large'"
      ref="videoRef"
      :src="video.videoUrl"
      :poster="video.posterUrl"
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      muted
      loop
      playsinline
      preload="metadata"
    />
    <img
      v-else
      :src="video.posterUrl"
      :alt="video.title"
      loading="lazy"
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    <!-- سایه‌ی پایین برای خوانایی بهتر متن‌ها -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
    />

    <!-- نشان محصول قابل خرید -->
    <div
      v-if="video.product"
      class="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-nimoura-primary shadow-sm lg:h-7 lg:w-7"
    >
      <i class="pi pi-shopping-bag text-[11px]! lg:text-xs!" />
    </div>

    <!-- تعداد بازدید -->
    <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white lg:bottom-2 lg:left-2">
      <i class="pi pi-eye text-[11px]! lg:text-sm!" />
      <span class="text-caption-10 font-light lg:text-body-14 lg:font-medium font-modam">
        {{ formatViews(video.viewsCount) }}
      </span>
    </div>

    <!-- نشانه‌ی بی‌صدا بودن پخش خودکار -->
    <div
      v-if="size === 'large' && isPlaying"
      class="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white lg:h-6 lg:w-6"
    >
      <i class="pi pi-volume-off text-[10px]! lg:text-xs!" />
    </div>

    <!-- آیکون پلی روی تایل‌های کوچیک (فقط هاور دسکتاپ) -->
    <div
      v-if="size === 'small'"
      class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      <i class="pi pi-play-circle text-white text-3xl! drop-shadow-lg" />
    </div>
  </div>
</template>