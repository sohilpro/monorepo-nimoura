<script setup lang="ts">
const categoryId = ref<number | null>(null);
const { videos, pending, loadMore } = useExploreFeed({
  scope: "explore",
  categoryId,
});

// دسته‌بندی لیست پیوسته‌ی ویدیوها به بخش‌های ۵تایی (هماهنگ با limit درخواست به بک‌اند)
const sections = computed(() => {
  const chunks: ExploreVideo[][] = [];
  for (let i = 0; i < videos.value.length; i += 5) {
    chunks.push(videos.value.slice(i, i + 5));
  }
  return chunks;
});

const sentinelRef = ref<HTMLElement | null>(null);
let sentinelObserver: IntersectionObserver | null = null;

onMounted(() => {
  loadMore();
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "600px 0px" }, // قبل از رسیدن واقعی به ته صفحه، لود بعدی شروع بشه
  );
  if (sentinelRef.value) sentinelObserver.observe(sentinelRef.value);
});
onBeforeUnmount(() => sentinelObserver?.disconnect());

const modalVisible = ref(false);
const modalStartIndex = ref(0);
function openVideo(index: number) {
  modalStartIndex.value = index;
  modalVisible.value = true;
}
</script>

<template>
  <div class="min-h-dvh w-full">
    <div class="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <VideoCategorytabs v-model="categoryId" />
    </div>

    <div class="mx-auto w-full max-w-225 px-2 py-2 lg:px-4 lg:py-4">
      <TransitionGroup
        tag="div"
        class="flex flex-col gap-2 lg:gap-3"
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-3"
      >
        <VideoGridSection
          v-for="(section, sIndex) in sections"
          :key="sIndex"
          :videos="section"
          @open="(i) => openVideo(sIndex * 5 + i)"
        />
      </TransitionGroup>

      <div v-if="pending" class="mt-2 flex flex-col gap-2 lg:gap-3">
        <VideoGridSkeleton />
        <VideoGridSkeleton v-if="sections.length === 0" />
      </div>

      <div
        v-if="!pending && sections.length === 0"
        class="flex h-[60dvh] flex-col items-center justify-center gap-2 text-nimoura-text-400"
      >
        <i class="pi pi-video text-3xl!" />
        <p class="text-sm">ویدیویی برای این دسته‌بندی یافت نشد.</p>
      </div>

      <div ref="sentinelRef" class="h-1 w-full" />
    </div>

    <VideoFeedModal
      v-model:visible="modalVisible"
      :videos="videos"
      :start-index="modalStartIndex"
      :pending="pending"
      @load-more="loadMore"
    />
  </div>
</template>