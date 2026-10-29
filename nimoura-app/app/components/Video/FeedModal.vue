<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  videos: ExploreVideo[];
  startIndex: number;
  pending?: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [boolean];
  "load-more": [];
}>();

const activeIndex = ref(props.startIndex);
const containerRef = ref<HTMLElement | null>(null);

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    activeIndex.value = props.startIndex;
    await nextTick();
    const target = containerRef.value?.children[props.startIndex] as HTMLElement | undefined;
    target?.scrollIntoView({ block: "start" });
  },
);

function onSlideVisible(index: number) {
  activeIndex.value = index;
  if (index >= props.videos.length - 2) emit("load-more");
}

function close() {
  emit("update:visible", false);
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-90 flex items-center justify-center bg-black md:bg-black/80 md:backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="relative h-dvh w-full overflow-hidden bg-black md:h-[92dvh] md:max-h-[900px] md:w-[420px] md:rounded-[28px] md:shadow-2xl md:ring-1 md:ring-white/10"
        >
          <button
            type="button"
            class="absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-90"
            @click="close"
          >
            <i class="pi pi-times text-lg!" />
          </button>

          <div
            ref="containerRef"
            class="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          >
            <VideoCard
              v-for="(video, index) in videos"
              :key="video.id"
              :video="video"
              :is-active="visible && index === activeIndex"
              class="h-full w-full snap-start snap-always"
              @visible="onSlideVisible(index)"
            />

            <div
              v-if="pending"
              class="flex h-full w-full items-center justify-center text-white snap-start"
            >
              <i class="pi pi-spin pi-spinner text-3xl!" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>