<script setup lang="ts">
const props = defineProps<{
  video: ExploreVideo;
  isActive: boolean;
}>();

const emit = defineEmits<{ visible: [] }>();

const videoRef = ref<HTMLVideoElement | null>(null);
const rootRef = ref<HTMLElement | null>(null);

const isPlaying = ref(false);
const showPoster = ref(true); // تا شروع اولین پخش، پوستر روی ویدیو می‌مونه
const liked = ref(props.video.isLiked ?? false);
const likesCount = ref(props.video.likesCount);
const showComments = ref(false);
const viewRegistered = ref(false);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || entry.intersectionRatio < 0.6) return;

      emit("visible");

      if (!viewRegistered.value) {
        viewRegistered.value = true;
        $fetch(`/api/explore/videos/${props.video.id}/view`, {
          method: "POST",
        }).catch(() => {});
      }
    },
    { threshold: [0.6] },
  );
  observer.observe(rootRef.value);
});

onBeforeUnmount(() => observer?.disconnect());

// وقتی این اسلاید فعال/غیرفعال می‌شه، پخش رو کنترل کن (فقط ویدیوی فعال پخش می‌شه)
watch(
  () => props.isActive,
  (active) => {
    if (!videoRef.value) return;
    if (active) {
      videoRef.value
        .play()
        .then(() => {
          isPlaying.value = true;
          showPoster.value = false;
        })
        .catch(() => {});
    } else {
      videoRef.value.pause();
      videoRef.value.currentTime = 0;
      isPlaying.value = false;
      showPoster.value = true;
    }
  },
);

function togglePlay() {
  if (!videoRef.value) return;
  if (isPlaying.value) {
    videoRef.value.pause();
    isPlaying.value = false;
  } else {
    videoRef.value.play();
    isPlaying.value = true;
    showPoster.value = false;
  }
}

async function toggleLike() {
  const wasLiked = liked.value;
  // آپدیت خوش‌بینانه؛ در صورت خطا برمی‌گرده
  liked.value = !wasLiked;
  likesCount.value += liked.value ? 1 : -1;

  try {
    const res = await $fetch<{ liked: boolean; likesCount: number }>(
      `/api/explore/videos/${props.video.id}/like`,
      { method: "POST" },
    );
    liked.value = res.liked;
    likesCount.value = res.likesCount;
  } catch {
    liked.value = wasLiked;
    likesCount.value = props.video.likesCount;
  }
}

async function share() {
  const url = `${location.origin}/explore/${props.video.id}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: props.video.title, url });
    } catch {
      // کاربر خودش لغو کرده، نیازی به هندل نیست
    }
    return;
  }
  await navigator.clipboard.writeText(url);
}
</script>

<template>
  <section ref="rootRef" class="relative bg-black flex items-center justify-center">
    <video
      ref="videoRef"
      :src="video.videoUrl"
      :poster="video.posterUrl"
      class="h-full w-full object-contain"
      playsinline
      loop
      muted
      preload="metadata"
      @click="togglePlay"
    />

    <!-- پوستر: تا شروع پخش نشون داده می‌شه -->
    <div v-if="showPoster" class="absolute inset-0" @click="togglePlay">
      <img :src="video.posterUrl" class="h-full w-full object-contain" :alt="video.title" />
      <div class="absolute inset-0 flex items-center justify-center bg-black/10">
        <i class="pi pi-play-circle text-white text-6xl! drop-shadow-lg"/>
      </div>
    </div>

    <!-- آیکون پلی وسط صفحه وقتی به‌صورت دستی پاز شده -->
    <div
      v-else-if="!isPlaying"
      class="absolute inset-0 flex items-center justify-center"
      @click="togglePlay"
    >
      <i class="pi pi-play-circle text-white text-6xl! drop-shadow-lg" />
    </div>

    <!-- ستون اکشن‌ها -->
    <div class="absolute right-3 bottom-44 flex flex-col items-center gap-5 text-white">
      <button class="flex flex-col items-center gap-1" @click.stop="toggleLike">
        <i
          class="pi pi-heart-fill text-2xl! transition-transform active:scale-125"
          :class="liked ? 'text-red-500' : 'text-white'"
        />
        <span class="text-xs font-modam">{{ likesCount }}</span>
      </button>

      <button class="flex flex-col items-center gap-1" @click.stop="showComments = true">
        <i class="pi pi-comment text-2xl!" />
        <span class="text-xs font-modam">{{ video.commentsCount }}</span>
      </button>

      <button class="flex flex-col items-center gap-1" @click.stop="share">
        <i class="pi pi-send text-2xl!" />
      </button>
    </div>

    <!-- عنوان و توضیحات -->
    <div class="absolute bottom-4 right-3 left-20 text-white space-y-1">
      <p class="font-medium line-clamp-1">{{ video.title }}</p>
      <p v-if="video.description" class="text-sm text-white/80 line-clamp-2">
        {{ video.description }}
      </p>
    </div>

    <!-- کارت کوچیک محصول لینک‌شده -->
    <NuxtLink
      v-if="video.product"
      :to="`/product/${video.product.id}/${video.product.slug}`"
      class="absolute bottom-24 right-3 left-3 flex items-center gap-3 bg-white/95 backdrop-blur rounded-xl p-2 shadow-lg"
      @click.stop
    >
      <img
        :src="video.product.thumbnail || '/images/placeholder-product.jpg'"
        class="w-12 h-12 rounded-lg object-cover shrink-0"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm text-nimoura-text-800 line-clamp-1">{{ video.product.title }}</p>
        <p class="text-nimoura-primary font-modam font-semibold text-sm">
          {{ numberFormat(video.product.priceDiscount || video.product.price) }}
          <span class="text-xs font-medium">تومان</span>
        </p>
      </div>
      <i class="pi pi-chevron-left text-nimoura-text-400" />
    </NuxtLink>

    <VideoCommentsSheet
      v-model:visible="showComments"
      :video-id="video.id"
    />
  </section>
</template>