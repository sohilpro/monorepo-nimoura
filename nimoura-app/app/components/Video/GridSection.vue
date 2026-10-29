<script setup lang="ts">
defineProps<{
  videos: ExploreVideo[];
}>();

const emit = defineEmits<{ open: [index: number] }>();
</script>

<template>
  <div class="grid grid-cols-3 gap-2 lg:gap-2.5">
    <VideoTile
      v-if="videos[0]"
      :video="videos[0]"
      size="large"
      class="row-span-2"
      @open="emit('open', 0)"
    />
    <VideoTile
      v-for="(video, i) in videos.slice(1)"
      :key="video.id"
      :video="video"
      size="small"
      @open="emit('open', i + 1)"
    />
  </div>
</template>