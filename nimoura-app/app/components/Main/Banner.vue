<template>
  <section
    class="mx-4 lg:container mt-10 lg:mt-20 flex flex-col lg:flex-row gap-5 child:rounded-xl child:overflow-hidden"
  >
    <NuxtLink
      v-for="(banner, index) in banners"
      :key="index"
      :to="banner.link"
      class="group flex-1 w-full"
    >
      <NuxtPicture
        :src="banner.image"
        :alt="banner.alt || ''"
        format="avif,webp,jpeg,png"
        :imgAttrs="{
          class:
            'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
        }"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  banners: {
    link: string;
    image: string;
    alt?: string;
  }[];
}>();
</script>
